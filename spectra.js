import data from './spectra-data.json' with {type:'json'};
// NIST Strong Lines: only neutral species I, air wavelengths 380–750 nm, positive tabulated intensities.
export const SPECTRA=data;
// Air wavelengths used directly: approximate optical frequency, then ×10^-12.
export const audioFrequency=nm=>299792.458/nm;
export function spectralColor(nm){const hue=nm<440?275-(nm-380)*.6:nm<490?239-(nm-440)*1.2:nm<510?179-(nm-490)*3:nm<580?119-(nm-510)*.85:nm<645?60-(nm-580)*60/65:0;return 'hsl('+Math.max(0,hue)+',95%,60%)';}
