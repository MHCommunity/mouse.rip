import fs from 'node:fs';

/**
 * The image format a file's first bytes say it is, or null when they aren't an image we serve.
 *
 * A server can answer 200 with an HTML error page, or a download can stop short, and either would
 * otherwise be saved under a .png name and published as a broken image.
 */
export function imageType(bytes) {
  if (!bytes || bytes.length < 4) return null;
  const at = (offset, values) => values.every((value, i) => bytes[offset + i] === value);
  if (at(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (at(0, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (at(0, [0x47, 0x49, 0x46, 0x38])) return 'gif';
  if (bytes.length >= 12 && at(0, [0x52, 0x49, 0x46, 0x46]) && at(8, [0x57, 0x45, 0x42, 0x50])) return 'webp';
  return null;
}

/** imageType() for a file on disk, reading only its first bytes. */
export function fileImageType(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const bytes = Buffer.alloc(12);
    const read = fs.readSync(fd, bytes, 0, 12, 0);
    return imageType(bytes.subarray(0, read));
  } finally {
    fs.closeSync(fd);
  }
}
