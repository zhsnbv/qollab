#!/usr/bin/env python3
"""Compress only the 12 manifest jobs and copy their approved posters to runtime."""
from pathlib import Path
import subprocess,json,hashlib,shutil,concurrent.futures
ROOT=Path(__file__).resolve().parent
REPO=next(p for p in ROOT.parents if (p/'package.json').is_file())
ART=REPO/'artifacts/live-wallpapers-v11-2026-11-17';SRC=ART/'renders'
VIDEOS=REPO/'public/video/chat-themes';POSTERS=REPO/'public/img/chat-themes'
VIDEOS.mkdir(parents=True,exist_ok=True);POSTERS.mkdir(parents=True,exist_ok=True)
M=json.loads((ROOT/'manifest.json').read_text())
FF=shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg'
PROBE=shutil.which('ffprobe') or '/opt/homebrew/bin/ffprobe'
def run(job):
 name=job['id'];source=SRC/(name+'.mp4');dest=VIDEOS/(name+'.mp4');temp=VIDEOS/(name+'.part.mp4')
 assert source.is_file() and (SRC/(name+'.json')).is_file(),name+' incomplete source'
 cmd=[FF,'-hide_banner','-loglevel','error','-y','-i',str(source),'-an','-c:v','libx264','-preset','slow','-crf','20','-tune','animation','-x264-params','aq-mode=3:aq-strength=0.8','-pix_fmt','yuv420p','-profile:v','high','-level:v','3.1','-g','48','-keyint_min','48','-sc_threshold','0','-threads','2','-movflags','+faststart',str(temp)]
 subprocess.run(cmd,check=True);temp.replace(dest)
 poster=POSTERS/(name+'.webp');shutil.copyfile(SRC/(name+'.webp'),poster)
 r={'id':name,'video':str(dest.relative_to(REPO)),'poster':str(poster.relative_to(REPO)),'sourceBytes':source.stat().st_size,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'posterBytes':poster.stat().st_size,'posterSHA256':hashlib.sha256(poster.read_bytes()).hexdigest(),'encoding':{'codec':'libx264','preset':'slow','crf':20,'tune':'animation','aqMode':3,'aqStrength':.8,'requestedPixelFormat':'yuv420p','profile':'high','level':'3.1','gop':48,'audio':False}}
 v=json.loads(subprocess.check_output([PROBE,'-v','error','-select_streams','v:0','-show_entries','stream=pix_fmt,color_range,color_space,color_transfer,color_primaries','-of','json',str(dest)]))['streams'][0]
 r.update({'decodedPixelFormat':v['pix_fmt'],'colorRange':v.get('color_range','unknown'),'colorSpace':v.get('color_space','unknown'),'colorTransfer':v.get('color_transfer','unknown'),'colorPrimaries':v.get('color_primaries','unknown')})
 print(json.dumps(r),flush=True);return r
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as ex:rows=list(ex.map(run,M['jobs']))
(ART/'runtime-manifest.json').write_text(json.dumps({'jobs':rows,'totalVideoBytes':sum(r['bytes']for r in rows),'totalPosterBytes':sum(r['posterBytes']for r in rows)},indent=2))
print(json.dumps({'jobs':len(rows),'videoBytes':sum(r['bytes']for r in rows),'posterBytes':sum(r['posterBytes']for r in rows)}))
