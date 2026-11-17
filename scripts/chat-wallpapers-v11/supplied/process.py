#!/usr/bin/env python3
"""Rebuild the three supplied v11 loops without modifying source files."""
import argparse
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)
    ]))


def run(arguments, log):
    with log.open('w') as output:
        subprocess.run(['ffmpeg', '-hide_banner', '-y', *arguments], stdout=output, stderr=output, check=True)


def temporal(path):
    import numpy as np
    raw = subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:v:0',
        '-vf', 'scale=180:320:flags=area,format=gray', '-f', 'rawvideo', '-'
    ])
    frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 320, 180).astype(np.float32)
    steps = np.mean(np.abs(np.diff(frames, axis=0)), axis=(1, 2))
    boundary = float(np.mean(np.abs(frames[-1] - frames[0])))
    return {'analysis_size': [180, 320], 'frames': len(frames),
            'adjacent_mae_mean': float(np.mean(steps)), 'adjacent_mae_p95': float(np.percentile(steps, 95)),
            'boundary_mae': boundary, 'boundary_over_mean': boundary / max(float(np.mean(steps)), 1e-6)}


def quality(runtime, master, width, height, log):
    graph = (
        f'[0:v]scale={width}:{height}:flags=lanczos,settb=AVTB,setpts=N/(24*TB),split=2[c0][c1];'
        f'[1:v]scale={width}:{height}:flags=lanczos,settb=AVTB,setpts=N/(24*TB),split=2[r0][r1];'
        '[c0][r0]ssim[s];[c1][r1]psnr[p]'
    )
    result = subprocess.run([
        'ffmpeg', '-hide_banner', '-threads', '1', '-i', str(runtime), '-threads', '1', '-i', str(master),
        '-filter_complex_threads', '1', '-filter_complex', graph, '-map', '[s]', '-map', '[p]', '-an', '-f', 'null', '-'
    ], capture_output=True, text=True, check=True)
    log.write_text(result.stderr)
    return {'comparison_size': [width, height],
            'ssim': float(re.findall(r'All:([\d.]+)', result.stderr)[-1]),
            'psnr_db': float(re.findall(r'average:([\d.]+)', result.stderr)[-1])}


def validate_source(path, recipe, allow_changed):
    if not path.is_file():
        raise ValueError(f'Missing source: {path}')
    digest = sha256(path)
    if digest != recipe['source_sha256'] and not allow_changed:
        raise ValueError(f'{path.name}: source SHA256 differs; use the archived original or explicitly --allow-source-change')
    data = probe(path)
    video = next(stream for stream in data['streams'] if stream['codec_type'] == 'video')
    if (video['width'], video['height'], Fraction(video['avg_frame_rate']), int(video['nb_frames'])) != (1080, 1920, 24, 240):
        raise ValueError(f'{path.name}: this recipe expects 1080x1920, 24fps, exactly240 frames')
    return digest


def process(source, recipe, output, overwrite, keep_master, skip_metrics):
    from PIL import Image
    key = recipe['key']
    runtime = output / 'video' / Path(recipe['runtime_url']).name
    poster = output / 'posters' / Path(recipe['poster_url']).name
    logs = output / 'qa'
    for folder in (runtime.parent, poster.parent, logs):
        folder.mkdir(parents=True, exist_ok=True)
    if source.resolve() in (runtime.resolve(), poster.resolve()):
        raise ValueError('Output must not overwrite its input')
    if not overwrite and (runtime.exists() or poster.exists()):
        raise ValueError(f'Output exists for {key}; use a new output directory or --overwrite')
    before = sha256(source)
    with tempfile.TemporaryDirectory(prefix=f'{key}-work-', dir=output) as scratch:
        master = Path(scratch) / f'{key}-loop-master.mkv'
        w = '(3*pow(T/(23/24),2)-2*pow(T/(23/24),3))'
        graph = (
            '[0:v]split=3[mid][tail][head];'
            '[mid]trim=start_frame=24:end_frame=216,setpts=PTS-STARTPTS[m];'
            '[tail]trim=start_frame=216:end_frame=240,setpts=PTS-STARTPTS[t];'
            '[head]trim=start_frame=0:end_frame=24,setpts=PTS-STARTPTS[h];'
            f"[t][h]blend=all_expr='A*(1-{w})+B*{w}'[join];[m][join]concat=n=2:v=1:a=0[out]"
        )
        run(['-threads', '2', '-i', str(source), '-filter_complex_threads', '1', '-filter_complex', graph,
             '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '0', '-threads', '2',
             '-pix_fmt', 'yuv420p', '-fps_mode', 'cfr', '-r', '24', str(master)], logs / f'{key}-master.log')
        run(['-threads', '2', '-i', str(master), '-vf', 'scale=720:1280:flags=lanczos', '-an', '-map_metadata', '-1',
             '-c:v', 'libx264', '-preset', 'slow', '-crf', str(recipe['crf']), '-threads', '2', '-pix_fmt', 'yuv420p',
             '-profile:v', 'high', '-level:v', '4.0', '-g', '48', '-force_key_frames', '0,8.958333333',
             '-movflags', '+faststart', '-color_range', 'tv', '-colorspace', 'smpte170m', '-color_primaries', 'bt709',
             '-color_trc', 'iec61966-2-1', str(runtime)], logs / f'{key}-runtime.log')
        frame = Path(scratch) / 'frame0.png'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(runtime), '-frames:v', '1',
                        '-vf', 'scale=768:-1:flags=lanczos', str(frame)], check=True)
        Image.open(frame).save(poster, format='WEBP', quality=85, method=6)
        subprocess.run(['ffmpeg', '-v', 'error', '-i', str(runtime), '-f', 'null', '-'], check=True)
        info = probe(runtime)
        stream = info['streams'][0]
        assert len(info['streams']) == 1 and stream['codec_name'] == 'h264' and int(stream['nb_frames']) == 216
        result = {'id': recipe['id'], 'name': recipe['name'], 'source_filename': source.name, 'source_sha256': before,
                  'video': str(runtime.relative_to(output)), 'poster': str(poster.relative_to(output)),
                  'width': stream['width'], 'height': stream['height'], 'fps': stream['avg_frame_rate'],
                  'duration_seconds': float(info['format']['duration']), 'frames': 216, 'audio_streams': 0,
                  'video_bytes': runtime.stat().st_size, 'video_sha256': sha256(runtime),
                  'poster_bytes': poster.stat().st_size, 'poster_sha256': sha256(poster),
                  'runtime_matches_v11': sha256(runtime) == recipe['runtime_sha256']}
        if not skip_metrics:
            result['quality_native'] = quality(runtime, master, 720, 1280, logs / f'{key}-native.log')
            result['quality_mobile'] = quality(runtime, master, 390, 694, logs / f'{key}-mobile.log')
            result['loop_original'] = temporal(source)
            result['loop_master'] = temporal(master)
            result['loop_runtime'] = temporal(runtime)
        if keep_master:
            (output / 'masters').mkdir(exist_ok=True)
            shutil.copy2(master, output / 'masters' / master.name)
    if sha256(source) != before:
        raise RuntimeError(f'Source changed unexpectedly: {source}')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', required=True, type=Path, help='Directory containing original supplied MP4s')
    parser.add_argument('--output-dir', type=Path, help='New delivery directory; never the application public directory')
    parser.add_argument('--only', choices=['coast', 'prism', 'poppies'], nargs='+', help='Optional subset')
    for key in ('coast', 'prism', 'poppies'):
        parser.add_argument(f'--{key}', type=Path, help=f'Override {key} filename or full source path')
    parser.add_argument('--verify-only', action='store_true', help='Validate source hashes/specification, without encoding')
    parser.add_argument('--allow-source-change', action='store_true', help='Permit different source bytes with the same exact frame specification')
    parser.add_argument('--overwrite', action='store_true', help='Overwrite outputs, never sources')
    parser.add_argument('--keep-master', action='store_true', help='Keep large lossless intermediate masters')
    parser.add_argument('--skip-metrics', action='store_true', help='Skip SSIM/PSNR/temporal analysis, keep full decode checks')
    args = parser.parse_args()
    if not args.verify_only and args.output_dir is None:
        parser.error('--output-dir is required unless --verify-only is used')
    config = json.loads((HERE / 'manifest.json').read_text())
    selected = [item for item in config['assets'] if not args.only or item['key'] in args.only]
    sources = {}
    for item in selected:
        path = getattr(args, item['key']) or Path(item['source_filename'])
        if not path.is_absolute():
            path = args.input_dir / path
        sources[item['key']] = path.resolve()
        digest = validate_source(path, item, args.allow_source_change)
        print(json.dumps({'source': item['key'], 'sha256': digest, 'verified': True}), flush=True)
    if args.verify_only:
        return
    output = args.output_dir.resolve()
    output.mkdir(parents=True, exist_ok=True)
    results = []
    for item in selected:
        result = process(sources[item['key']], item, output, args.overwrite, args.keep_master, args.skip_metrics)
        results.append(result)
        (output / 'manifest.json').write_text(json.dumps({'recipe': 'qollab-v11-supplied', 'assets': results}, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(result, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
