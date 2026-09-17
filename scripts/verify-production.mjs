import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='https://qollab.netlify.app';
const index=await readFile('dist/index.html','utf8');
const assetPaths=[...index.matchAll(/(?:src|href)="(\/assets\/[^\"]+\.(?:js|css))"/g)].map(m=>m[1]);
for(const path of assetPaths){
 const remote=await fetch(base+path);assert.equal(remote.status,200);
 const digest=buffer=>createHash('sha256').update(buffer).digest('hex');
 assert.equal(digest(Buffer.from(await remote.arrayBuffer())),digest(await readFile('dist'+path)),`Asset differs: ${path}`);
}
for(const path of ['/calls/one-to-one','/all?group=calls','/chats','/storybook/','/handoff/call-waves/demo.html','/img/calls/shared-release-plan.svg','/handoff/qollab-call-waves.zip']){
 const response=await fetch(base+path);assert.equal(response.status,200,path);
 const type=response.headers.get('content-type');
 if(path.endsWith('.zip'))assert.match(type,/zip|octet-stream/);
 if(path.endsWith('.svg'))assert.match(type,/svg/);
 if(path.startsWith('/all')){const html=await response.text();for(const asset of assetPaths)assert.ok(html.includes(asset));}
 console.log(`OK ${path} (${type})`);
}
console.log('PASS: production assets match the local build; app, gallery, Storybook and handoff are available.');
