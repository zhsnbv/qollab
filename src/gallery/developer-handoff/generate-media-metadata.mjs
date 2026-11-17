// Run from any directory: node src/gallery/developer-handoff/generate-media-metadata.mjs
// Requires ffprobe; metadata is derived from the same runtime files as the app.
import { execFileSync } from 'node:child_process';
import { statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { CHAT_PRESETS } from '../../utils/chatThemeCatalog.js';
const directory = fileURLToPath(new URL('.', import.meta.url));
const project = resolve(directory, '../../..');
const metadata = Object.fromEntries(CHAT_PRESETS.filter(theme => theme.video).map(theme => {
  const path = resolve(project, `public${theme.video}`);
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,codec_name,codec_type,pix_fmt,color_range:format=duration', '-of', 'json', path], { encoding: 'utf8' }));
  const stream = probe.streams.find(item => item.codec_type === 'video');
  return [theme.id, { width: stream.width, height: stream.height, duration: Number(probe.format.duration), bytes: statSync(path).size, codec: stream.codec_name, pixelFormat: stream.pix_fmt, colorRange: stream.color_range, audio: probe.streams.some(item => item.codec_type === 'audio') }];
}));
writeFileSync(resolve(directory, 'mediaMetadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Updated ${Object.keys(metadata).length} runtime videos.`);
