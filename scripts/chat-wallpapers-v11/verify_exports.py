#!/usr/bin/env python3
from pathlib import Path
import json,subprocess,hashlib,shutil,sys
ROOT=Path(__file__).resolve().parent
REPO=next(p for p in ROOT.parents if (p/'package.json').is_file())
OUT=REPO/'artifacts/live-wallpapers-v11-2026-11-17/renders'
M=json.loads((ROOT/'manifest.json').read_text())
RUNTIME='--runtime' in sys.argv
VIDEO_DIR=REPO/'public/video/chat-themes' if RUNTIME else OUT
POSTER_DIR=REPO/'public/img/chat-themes' if RUNTIME else OUT
FF=shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg';PROBE=shutil.which('ffprobe') or '/opt/homebrew/bin/ffprobe'
rows=[]
for j in M['jobs']:
 p=VIDEO_DIR/(j['id']+'.mp4');poster=POSTER_DIR/(j['id']+'.webp');q=OUT/(j['id']+'.json')
 if not (p.exists() and poster.exists() and q.exists()):
  rows.append({'id':j['id'],'complete':False});continue
 info=json.loads(subprocess.check_output([PROBE,'-v','error','-count_frames','-show_streams','-show_format','-of','json',str(p)]))
 vs=[s for s in info['streams'] if s['codec_type']=='video'];audio=[s for s in info['streams'] if s['codec_type']=='audio'];v=vs[0]
 n=int(v['nb_read_frames']);duration=float(info['format']['duration']);qa=json.loads(q.read_text())
 selection=f"select='eq(n,0)+eq(n,1)+eq(n,{n//4})+eq(n,{n-2})+eq(n,{n-1})',scale=180:320"
 data=subprocess.check_output([FF,'-v','error','-i',str(p),'-vf',selection,'-fps_mode','passthrough','-pix_fmt','rgb24','-f','rawvideo','-'])
 size=180*320*3;frames=[data[i:i+size] for i in range(0,len(data),size)]
 assert len(frames)==5,j['id']
 def mad(a,b):return sum(abs(x-y) for x,y in zip(a,b))/len(a)
 first=mad(frames[0],frames[1]);last=mad(frames[-2],frames[-1]);seam=mad(frames[-1],frames[0]);quarter=mad(frames[0],frames[2])
 row={'id':j['id'],'complete':True,'width':v['width'],'height':v['height'],'fps':v['avg_frame_rate'],'frames':n,'seconds':duration,'audioStreams':len(audio),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'posterBytes':poster.stat().st_size,'posterSHA256':hashlib.sha256(poster.read_bytes()).hexdigest(),'sourceEndpointMaxDifference':qa['endpoint']['maxDifference'],'decoded':{'firstStepMAD':first,'lastStepMAD':last,'seamMAD':seam,'quarterMotionMAD':quarter,'seamToAdjacentRatio':seam/max((first+last)/2,1e-6)}}
 row.update({'decodedPixelFormat':v['pix_fmt'],'colorRange':v.get('color_range','unknown'),'colorSpace':v.get('color_space','unknown'),'colorTransfer':v.get('color_transfer','unknown'),'colorPrimaries':v.get('color_primaries','unknown')})
 row['relativeSeamOutlier']=row['decoded']['seamToAdjacentRatio']>=3
 row['pass']=v['width']==720 and v['height']==1280 and v['avg_frame_rate']=='24/1' and n==576 and abs(duration-24)<.06 and not audio and row['sourceEndpointMaxDifference']==0 and quarter>0.5 and row['decoded']['seamMAD']<=1.5
 rows.append(row);print(json.dumps(row),flush=True)
result={'complete':all(r.get('complete') for r in rows),'allPass':all(r.get('pass') for r in rows),'jobs':rows,'mode':'runtime' if RUNTIME else 'master','seamAcceptance':{'absoluteMADMax':1.5,'units':'8-bit channel difference, 0..255','relativeRatioFlag':3},'note':'Decoded seam measured at 180x320. Absolute mean error <=1.5/255 is accepted; ratio>=3 is retained as a separate flag because near-static gradients have tiny adjacent steps. Full-resolution source endpoint must be pixel-exact. Visual acceptance remains separate.'}
(OUT/('runtime-validation.json' if RUNTIME else 'validation.json')).write_text(json.dumps(result,indent=2))
print(json.dumps({'complete':result['complete'],'allPass':result['allPass'],'jobs':len(rows),'totalMP4Bytes':sum(r.get('bytes',0)for r in rows)}))
