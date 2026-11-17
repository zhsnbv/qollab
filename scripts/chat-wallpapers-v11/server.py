#!/usr/bin/env python3
"""Local-only renderer server. Known job IDs, restricted upload types, deterministic output paths."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import json,subprocess,hashlib,sys,shutil
ROOT=Path(__file__).resolve().parent
REPO=next(p for p in ROOT.parents if (p/'package.json').is_file())
OUT=REPO/'artifacts/live-wallpapers-v11-2026-11-17/renders';OUT.mkdir(parents=True,exist_ok=True)
JOBS={j['id'] for j in json.loads((ROOT/'manifest.json').read_text())['jobs']}
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def do_GET(self):
  if self.path=='/status':
   rows=[json.loads(f.read_text()) for f in OUT.glob('live-*.json')]
   self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(json.dumps({'completed':len(rows),'jobs':rows}).encode());return
  return super().do_GET()
 def do_POST(self):
  name=self.path.removeprefix('/save/');path=Path(name)
  if not self.path.startswith('/save/') or path.name!=name or not ((path.stem in JOBS and path.suffix in ['.h264','.webp','.json']) or name=='batch-complete.json'):
   self.send_error(400,'Invalid output');return
  n=int(self.headers.get('Content-Length','0'))
  if n<=0 or n>100_000_000:self.send_error(413,'Invalid upload size');return
  data=self.rfile.read(n);target=OUT/name;target.write_bytes(data)
  result={'path':str(target),'bytes':n,'sha256':hashlib.sha256(data).hexdigest()}
  if path.suffix=='.h264':
   mp4=target.with_suffix('.mp4')
   process=subprocess.run([(shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg'),'-hide_banner','-loglevel','error','-y','-r','24','-i',str(target),'-c:v','copy','-an','-movflags','+faststart',str(mp4)],capture_output=True,text=True)
   if process.returncode:self.send_error(500,process.stderr[:2000]);return
   result['mp4']={'path':str(mp4),'bytes':mp4.stat().st_size,'sha256':hashlib.sha256(mp4.read_bytes()).hexdigest()}
  self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(json.dumps(result).encode())
if __name__=='__main__':
 port=int(sys.argv[1]) if len(sys.argv)>1 else 8766
 print(f'Open http://127.0.0.1:{port}/ in Chrome, then Preview first frames and Start all exports.',flush=True)
 ThreadingHTTPServer(('127.0.0.1',port),Handler).serve_forever()
