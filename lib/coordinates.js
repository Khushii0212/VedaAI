// ============================================================
// VedaAI — Coordinate Utilities
// Converts normalized 0-1000 AI coordinates to pixel positions.
// ============================================================

const COORD_SPACE = 1000;

/**
 * Convert a normalized bounding box (0-1000) to pixel rect.
 * @param {{x,y,width,height}} box - Normalized bounding box
 * @param {{width,height}} dimensions - Rendered page dimensions in pixels
 * @param {number} zoom - Current zoom level (1 = 100%)
 * @returns {{x,y,width,height}} Pixel rect
 */
export function normalizedToPixel(box, dimensions, zoom = 1) {
  const scaleX = (dimensions.width * zoom) / COORD_SPACE;
  const scaleY = (dimensions.height * zoom) / COORD_SPACE;
  return {
    x: box.x * scaleX,
    y: box.y * scaleY,
    width: box.width * scaleX,
    height: box.height * scaleY,
  };
}

/**
 * Expand a bounding box by padding (in normalized units, 0-1000).
 */
export function expandBoundingBox(box, padding = 10) {
  return {
    x: Math.max(0, box.x - padding),
    y: Math.max(0, box.y - padding),
    width: Math.min(COORD_SPACE - box.x + padding, box.width + padding * 2),
    height: Math.min(COORD_SPACE - box.y + padding, box.height + padding * 2),
  };
}

/**
 * Clamp all bounding box values to valid 0-1000 range.
 */
export function clampBoundingBox(box) {
  const x = Math.max(0, Math.min(COORD_SPACE, box.x));
  const y = Math.max(0, Math.min(COORD_SPACE, box.y));
  const w = Math.max(0, Math.min(COORD_SPACE - x, box.width));
  const h = Math.max(0, Math.min(COORD_SPACE - y, box.height));
  return { x, y, width: w, height: h };
}

/**
 * Check if a bounding box is valid (non-zero area, within bounds).
 */
export function isValidBoundingBox(box) {
  return (
    box.x >= 0 &&
    box.y >= 0 &&
    box.width > 5 &&
    box.height > 5 &&
    box.x + box.width <= COORD_SPACE &&
    box.y + box.height <= COORD_SPACE
  );
}

/**
 * Merge multiple bounding boxes into one that contains all of them.
 */
export function mergeBoundingBoxes(boxes) {
  if (!boxes || boxes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const box of boxes) {
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Given a rendered container width and original page width, compute scale factor.
 */
export function computeScale(containerWidth, originalWidth) {
  if (!originalWidth) return 1;
  return containerWidth / originalWidth;
}
