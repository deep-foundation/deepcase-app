import md5 from 'md5';

export function getColorFromId(id) {
  let hash = md5(id);
  let r = parseInt(hash.substr(0, 2), 16) % 128 + 128;
  let g = (parseInt(hash.substr(2, 2), 16) % 128) + 64;
  let b = parseInt(hash.substr(4, 2), 16) % 128 + 128;
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}