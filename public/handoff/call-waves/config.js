export const WAVE_PALETTES = {
 warm:['#faf4e9','#fbefe8'], active:['#e3fff7','#d3feda'],
 quiet:['#f2f2f2','#ebeff6'], declined:['#ffece3','#fed3d3'],
 reconnecting:['#e7eeff','#ded8fa'],
};
export const WAVE_DARK_PALETTES = {
 warm:['#57402f','#613829'], active:['#214c43','#3b542f'],
 quiet:['#343536','#313b48'], declined:['#593830','#643239'],
 reconnecting:['#303f62','#4a3b60'],
};
export const WAVE_STATES = {
 connecting:'warm',ringing:'warm',incoming:'warm',active:'active',
 reconnecting:'reconnecting',busy:'quiet',unanswered:'quiet',unavailable:'quiet',
 ended:'quiet',canceled:'quiet',elsewhere:'quiet',declined:'declined',failed:'declined',
};
export const WAVE_TIMING = { driftA:9000,driftB:11000,pulseA:4800,pulseB:6200,pulseBOffset:-1800,light:8000,palette:1400 };
export const WAVE_TERMINAL = ['busy','unanswered','unavailable','ended','canceled','elsewhere','declined','failed'];
export function paletteFor(status,theme='light'){return (theme==='dark'?WAVE_DARK_PALETTES:WAVE_PALETTES)[WAVE_STATES[status]||'warm'];}
