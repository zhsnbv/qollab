import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as Icons from '@phosphor-icons/react';
import { writeFileSync } from 'node:fs';

const groups = {
  day: ['Coffee', 'Sun', 'Headphones', 'NotePencil', 'Heart', 'ChatCircle', 'Camera', 'Sparkle', 'MusicNote', 'Smiley', 'BookOpen', 'EnvelopeSimple'],
  orbit: ['Planet', 'Rocket', 'Star', 'Moon', 'Alien', 'Sparkle', 'Sun', 'CloudMoon', 'StarFour', 'Atom', 'FlyingSaucer', 'GlobeHemisphereWest'],
  garden: ['Leaf', 'Flower', 'FlowerTulip', 'Plant', 'Butterfly', 'CloudSun', 'Drop', 'Sun', 'Tree', 'Acorn', 'Bird', 'Rainbow'],
  travel: ['AirplaneTilt', 'Compass', 'MapPin', 'Mountains', 'Backpack', 'Camera', 'MapTrifold', 'Tent', 'Boat', 'GlobeHemisphereWest', 'SunHorizon', 'Signpost'],
  play: ['GameController', 'Headphones', 'MusicNotes', 'Star', 'Lightning', 'SmileyWink', 'Confetti', 'Basketball', 'PuzzlePiece', 'HandPeace', 'ShootingStar', 'MagicWand'],
};
// The same symbol instances repeat across both edges, making a seamless tile.
const width = 288, height = 336;
for (const [name, symbols] of Object.entries(groups)) {
  const defs = symbols.map((symbol, index) => {
    if (!Icons[symbol]) throw new Error(`Missing icon ${symbol}`);
    const markup = renderToStaticMarkup(React.createElement(Icons[symbol], { weight: 'thin', size: 256 }));
    return `<symbol id="i${index}" viewBox="0 0 256 256">${markup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</symbol>`;
  }).join('');
  const pieces = [];
  for (let row = 0; row < 7; row++) for (let col = 0; col < 6; col++) {
    const k = row * 6 + col, size = 29 + (k * 7 % 9);
    const x = col * 48 + (row % 2 ? 25 : 2) + (k * 11 % 9) - 4;
    const y = row * 48 + (k * 5 % 11) - 3;
    const angle = ((k * 17) % 35) - 17;
    const index = (col * 5 + row * 7) % symbols.length;
    for (const dx of [-width, 0, width]) for (const dy of [-height, 0, height]) {
      if (x + dx > width || x + dx + size < 0 || y + dy > height || y + dy + size < 0) continue;
      pieces.push(`<g transform="translate(${x+dx} ${y+dy}) rotate(${angle} ${size/2} ${size/2})"><use href="#i${index}" width="${size}" height="${size}"/></g>`);
    }
    const fx = (x + 39) % width, fy = (y + 38) % height;
    pieces.push(k % 3 ? `<circle cx="${fx}" cy="${fy}" r="1.1"/>` : `<path d="M${fx-2} ${fy}h4m-2-2v4" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>`);
  }
  writeFileSync(`public/img/chat-themes/pattern-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" color="#354658" fill="currentColor"><defs>${defs}</defs>${pieces.join('')}</svg>\n`);
}
