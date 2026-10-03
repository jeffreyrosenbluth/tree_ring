// ============================================================
// GENERATIVE TREE RINGS
// ============================================================

// ============================================================
// PARAMETERS
//
// Every entry becomes a slider in the control panel.
// Changing a slider regenerates the tree immediately.
// ============================================================

// All lengths are in units of an 800 x 800 design square,
// scaled to the output width when drawn.
const DESIGN_SIZE = 800;

// Output width in pixels (height is the same)
let outputWidth = 512;

// Largest off-screen render, in pixels, when supersampling
const MAX_RENDER_SIZE = 4096;

const PARAM_SPECS = [
  { group: "Structure" },
  {
    key: "NUM_VERTICES",
    label: "Vertices",
    value: 400,
    min: 50,
    max: 1000,
    step: 10,
  },
  { key: "NUM_RINGS", label: "Rings", value: 35, min: 1, max: 150, step: 1 },
  {
    key: "START_RADIUS",
    label: "Start radius",
    value: 5,
    min: 0,
    max: 100,
    step: 1,
  },
  {
    key: "GROWTH_RATE",
    label: "Growth rate",
    value: 7,
    min: 0.5,
    max: 15,
    step: 0.1,
  },

  // Main control for how irregular the tree becomes.
  { group: "Overall irregularity" },
  {
    key: "IRREGULARITY",
    label: "Irregularity",
    value: 0.8,
    min: 0,
    max: 3,
    step: 0.01,
  },
  // Every spot grows at least this fraction of the growth rate each
  // ring, so neighboring rings never pinch together.
  {
    key: "MIN_RING_GAP",
    label: "Min ring gap",
    value: 0.35,
    min: 0,
    max: 1,
    step: 0.01,
  },

  // Smaller scale = broad bulges, larger = more numerous bulges.
  // Smaller time scale = growth pattern persists longer.
  { group: "Large-scale shape" },
  {
    key: "MACRO_SCALE",
    label: "Scale",
    value: 0.75,
    min: 0.05,
    max: 5,
    step: 0.01,
  },
  {
    key: "MACRO_TIME_SCALE",
    label: "Time scale",
    value: 0.045,
    min: 0,
    max: 0.3,
    step: 0.001,
  },

  // Angular drift = how much features wander around the circumference.
  { group: "Medium-scale shape" },
  {
    key: "MEDIUM_STRENGTH",
    label: "Strength",
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "MEDIUM_SCALE",
    label: "Scale",
    value: 1.5,
    min: 0.05,
    max: 8,
    step: 0.01,
  },
  {
    key: "MEDIUM_TIME_SCALE",
    label: "Time scale",
    value: 0.055,
    min: 0,
    max: 0.3,
    step: 0.001,
  },
  {
    key: "ANGULAR_DRIFT",
    label: "Angular drift",
    value: 0.022,
    min: 0,
    max: 0.2,
    step: 0.001,
  },

  // Ring-to-ring = some rings bold, some faint (like latewood bands).
  // Along ring = width swells and thins around each ring.
  // Variation above ~1 lets the width hit zero, breaking the line.
  { group: "Ring lines" },
  {
    key: "LINE_WEIGHT",
    label: "Line weight",
    value: 2.2,
    min: 0.1,
    max: 6,
    step: 0.1,
  },
  {
    key: "RING_WEIGHT_VARIATION",
    label: "Ring-to-ring variation",
    value: 0.8,
    min: 0,
    max: 2,
    step: 0.01,
  },
  {
    key: "ALONG_WEIGHT_VARIATION",
    label: "Along-ring variation",
    value: 0.8,
    min: 0,
    max: 2,
    step: 0.01,
  },
  {
    key: "ALONG_WEIGHT_SCALE",
    label: "Along-ring scale",
    value: 2.5,
    min: 0.1,
    max: 10,
    step: 0.1,
  },
  // In output pixels, unlike other lengths, so thin lines stay
  // solid at any width. Breaks (width zero) are left as gaps.
  {
    key: "MIN_LINE_WIDTH",
    label: "Min width (px)",
    value: 0.5,
    min: 0,
    max: 3,
    step: 0.1,
  },

  // Roughness scale: smaller = broad lumps, larger = fine jaggedness.
  // Notches are small V-shaped cuts into the outer edge.
  { group: "Bark" },
  {
    key: "BARK_THICKNESS",
    label: "Thickness",
    value: 14,
    min: 0,
    max: 60,
    step: 0.5,
  },
  {
    key: "BARK_ROUGHNESS",
    label: "Roughness",
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "BARK_SCALE",
    label: "Roughness scale",
    value: 6,
    min: 0.5,
    max: 20,
    step: 0.1,
  },
  {
    key: "BARK_NOTCHES",
    label: "Notches",
    value: 6,
    min: 0,
    max: 60,
    step: 1,
  },

  // Radial cracks: widest at the bark, narrowing to a point.
  // Depth = how far toward the pith they reach (1 = all the way).
  { group: "Wedge splits" },
  // The seed picks how many, between min and max count.
  {
    key: "WEDGE_MIN_COUNT",
    label: "Min count",
    value: 3,
    min: 0,
    max: 12,
    step: 1,
  },
  {
    key: "WEDGE_MAX_COUNT",
    label: "Max count",
    value: 4,
    min: 0,
    max: 12,
    step: 1,
  },
  { key: "WEDGE_WIDTH", label: "Width", value: 16, min: 0, max: 60, step: 0.5 },
  {
    key: "WEDGE_DEPTH",
    label: "Depth",
    value: 0.75,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "WEDGE_JAGGEDNESS",
    label: "Jaggedness",
    value: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
  },

  { group: "Appearance" },
  // The tree is scaled so its bark fills the canvas, less this margin
  // on each side (percent of the width).
  {
    key: "MARGIN",
    label: "Margin (%)",
    value: 5,
    min: 0,
    max: 30,
    step: 0.5,
  },
  {
    key: "TRANSPARENT",
    label: "Transparent background",
    type: "checkbox",
    value: false,
  },
  {
    key: "BG_VALUE",
    label: "Background",
    value: 255,
    min: 0,
    max: 255,
    step: 1,
  },
  {
    key: "STROKE_VALUE",
    label: "Stroke",
    value: 0,
    min: 0,
    max: 255,
    step: 1,
  },
  // Draw at this many times the output width, then shrink, for
  // smoother edges. Capped so the off-screen image stays <= 4096 px.
  {
    key: "SUPERSAMPLE",
    label: "Supersampling",
    value: 4,
    min: 1,
    max: 4,
    step: 1,
  },
  {
    key: "TREE_NOISE_SEED",
    label: "Noise seed",
    value: 19,
    min: 0,
    max: 1000,
    step: 1,
  },
];

// Current parameter values, keyed by name
const P = {};

for (const spec of PARAM_SPECS) {
  if (spec.key) P[spec.key] = spec.value;
}

// ============================================================
// STATE
// ============================================================

let radii = [];
let rings = [];

let currentRing = 0;

// Off-screen buffer the tree is drawn into before shrinking
let buffer;

// ============================================================
// SETUP
// ============================================================

function setup() {
  const canvas = createCanvas(outputWidth, outputWidth);
  canvas.parent("canvas-wrap");

  // One canvas pixel per output pixel, so the PNG matches the screen
  pixelDensity(1);

  updatePixelation();

  buildControls();

  animateTree();
}

// Show real pixels when the output is enlarged on screen; smooth
// when it is shrunk, where nearest-neighbor would drop lines.
function updatePixelation() {
  const canvas = drawingContext.canvas;

  const shownWidth =
    canvas.getBoundingClientRect().width * window.devicePixelRatio;

  canvas.classList.toggle("pixelated", outputWidth < shownWidth);
}

window.addEventListener("resize", () => updatePixelation());

// ============================================================
// DRAW
//
// While animating, generate ONE ring per frame.
// ============================================================

function draw() {
  // Generate next ring
  if (currentRing < P.NUM_RINGS) {
    growCurrentRing(currentRing);

    saveCurrentRing();

    currentRing++;
  } else {
    noLoop();
  }

  renderTree();
}

// ============================================================
// SUPERSAMPLED RENDER
// ============================================================

// Draw the tree at a multiple of the output width into the buffer,
// then shrink it onto the main canvas.
function renderTree() {
  const factor = max(
    1,
    min(P.SUPERSAMPLE, floor(MAX_RENDER_SIZE / outputWidth)),
  );

  const size = outputWidth * factor;

  if (!buffer || buffer.width !== size) {
    if (buffer) buffer.remove();

    buffer = createGraphics(size, size);
    buffer.pixelDensity(1);
  }

  drawRings(buffer);

  drawingContext.canvas.classList.toggle("transparent", P.TRANSPARENT);

  const ctx = drawingContext;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(downscale(buffer.elt, outputWidth), 0, 0, width, height);
  ctx.restore();
}

// Resize a canvas to size x size pixels.
function scaledCopy(source, size) {
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;

  const ctx = out.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, size, size);

  return out;
}

// Shrink by halves (each step averages 2 x 2 blocks), then to the
// exact size.
function downscale(source, size) {
  let current = source;

  while (current.width / 2 >= size) {
    current = scaledCopy(current, Math.floor(current.width / 2));
  }

  return current.width === size ? current : scaledCopy(current, size);
}

// ============================================================
// SHAPES
//
// Every filled shape in the tree, in design units, shared by the
// PNG render and the SVG export. Each is { outline, hole }, with
// points as flat [x0, y0, x1, y1, ...] arrays; hole may be null.
// ============================================================

function buildShapes() {
  const n = rings[0].length;

  const cx = DESIGN_SIZE / 2;
  const cy = DESIGN_SIZE / 2;

  const cosT = new Array(n);
  const sinT = new Array(n);

  for (let i = 0; i < n; i++) {
    const theta = (TWO_PI * i) / n;

    cosT[i] = cos(theta);
    sinT[i] = sin(theta);
  }

  // Closed outline from one radius per vertex
  const polar = (radii) => {
    const pts = new Array(2 * n);

    for (let i = 0; i < n; i++) {
      pts[2 * i] = cx + radii[i] * cosT[i];
      pts[2 * i + 1] = cy + radii[i] * sinT[i];
    }

    return pts;
  };

  // Minimum width converted from output pixels to design units,
  // allowing for the fit zoom
  const minWidth = (P.MIN_LINE_WIDTH * DESIGN_SIZE) / (outputWidth * fit.scale);

  const shapes = [];

  // Rings, as variable-width ribbons

  for (let j = 0; j < rings.length; j++) {
    const ring = rings[j];

    const halfWidths = ringHalfWidths(j, n, minWidth);

    shapes.push({
      outline: polar(ring.map((r, i) => r + halfWidths[i])),
      hole: polar(ring.map((r, i) => max(0, r - halfWidths[i]))),
    });
  }

  // Wedge splits, opening at the last ring

  const lastRing = rings[rings.length - 1];

  for (const outline of wedgeOutlines(lastRing)) {
    shapes.push({ outline, hole: null });
  }

  // Bark, outside the last ring, after the wedges so it covers them

  if (P.BARK_THICKNESS > 0) {
    shapes.push({
      outline: polar(barkOuterRadii(lastRing)),
      hole: polar(lastRing),
    });
  }

  return shapes;
}

// ============================================================
// FIT
//
// Scale and center that make the finished tree's outer edge fill
// the canvas, less the margin.
// ============================================================

let fit = { scale: 1, cx: DESIGN_SIZE / 2, cy: DESIGN_SIZE / 2 };

function computeFit() {
  const lastRing = rings[rings.length - 1];

  const outer =
    P.BARK_THICKNESS > 0
      ? barkOuterRadii(lastRing)
      : lastRing.map((r) => r + P.LINE_WEIGHT);

  const n = outer.length;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < n; i++) {
    const theta = (TWO_PI * i) / n;

    const x = DESIGN_SIZE / 2 + outer[i] * cos(theta);
    const y = DESIGN_SIZE / 2 + outer[i] * sin(theta);

    minX = min(minX, x);
    minY = min(minY, y);
    maxX = max(maxX, x);
    maxY = max(maxY, y);
  }

  const size = max(maxX - minX, maxY - minY, 1);

  fit = {
    scale: (DESIGN_SIZE * (1 - (2 * P.MARGIN) / 100)) / size,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  };
}

// Design point to output pixels, with the fit applied.
function toOutput(x, y, outputSize) {
  const k = outputSize / DESIGN_SIZE;

  return [
    (DESIGN_SIZE / 2 + (x - fit.cx) * fit.scale) * k,
    (DESIGN_SIZE / 2 + (y - fit.cy) * fit.scale) * k,
  ];
}

// ============================================================
// DRAW THE TREE
// ============================================================

// Draw everything generated so far into graphics g.
function drawRings(g) {
  if (P.TRANSPARENT) {
    g.clear();
  } else {
    g.background(P.BG_VALUE);
  }

  g.push();

  g.scale(g.width / DESIGN_SIZE);
  g.translate(DESIGN_SIZE / 2, DESIGN_SIZE / 2);
  g.scale(fit.scale);
  g.translate(-fit.cx, -fit.cy);

  g.noStroke();
  g.fill(P.STROKE_VALUE);

  for (const shape of buildShapes()) {
    drawShape(g, shape);
  }

  g.pop();
}

function drawShape(g, { outline, hole }) {
  g.beginShape();

  for (let k = 0; k < outline.length; k += 2) {
    g.vertex(outline[k], outline[k + 1]);
  }

  // Hole runs the opposite way to cut it out
  if (hole) {
    g.beginContour();

    for (let k = hole.length - 2; k >= 0; k -= 2) {
      g.vertex(hole[k], hole[k + 1]);
    }

    g.endContour(CLOSE);
  }

  g.endShape(CLOSE);
}

// ============================================================
// VARIABLE STROKE WIDTH
// ============================================================

function ringHalfWidths(ringIndex, n, minWidth) {
  // Whole-ring boldness
  const ringFactor =
    1 + P.RING_WEIGHT_VARIATION * (2 * noise(ringIndex * 0.7, 200) - 1);

  const halfWidths = new Array(n);

  for (let i = 0; i < n; i++) {
    const theta = (TWO_PI * i) / n;

    // Swelling and thinning around the ring
    const along = periodicNoise(
      theta,
      300 + ringIndex * 0.15,
      P.ALONG_WEIGHT_SCALE,
      50,
    );

    const w =
      P.LINE_WEIGHT * ringFactor * (1 + P.ALONG_WEIGHT_VARIATION * along);

    halfWidths[i] = w > 0 ? max(w, minWidth) / 2 : 0;
  }

  return halfWidths;
}

// ============================================================
// BARK
// ============================================================

function barkOuterRadii(lastRing) {
  const n = lastRing.length;

  // Notch layout depends only on the seed
  randomSeed(P.TREE_NOISE_SEED * 7 + 1);

  const notches = [];

  for (let k = 0; k < P.BARK_NOTCHES; k++) {
    notches.push({
      angle: random(TWO_PI),
      halfWidth: random(0.01, 0.035),
      depth: random(0.5, 1.1),
    });
  }

  const outer = new Array(n);

  for (let i = 0; i < n; i++) {
    const theta = (TWO_PI * i) / n;

    const rough = constrain(
      2 * periodicNoise(theta, 0, P.BARK_SCALE, 90),
      -1,
      1,
    );

    let thickness = P.BARK_THICKNESS * (1 + P.BARK_ROUGHNESS * rough);

    for (const notch of notches) {
      const d = abs(angleDiff(theta, notch.angle));

      if (d < notch.halfWidth) {
        thickness -= P.BARK_THICKNESS * notch.depth * (1 - d / notch.halfWidth);
      }
    }

    outer[i] = lastRing[i] + max(0, thickness);
  }

  return outer;
}

// Signed difference between two angles, in -PI..PI.
function angleDiff(a, b) {
  let d = (a - b) % TWO_PI;

  if (d > PI) d -= TWO_PI;
  if (d < -PI) d += TWO_PI;

  return d;
}

// ============================================================
// WEDGE SPLITS
// ============================================================

// Number of wedges, chosen by the seed between min and max count.
// Hashed separately so wedge positions don't shift, and so
// neighboring seeds don't all get the same count.
function wedgeCount() {
  const lo = min(P.WEDGE_MIN_COUNT, P.WEDGE_MAX_COUNT);
  const hi = max(P.WEDGE_MIN_COUNT, P.WEDGE_MAX_COUNT);

  return lo + (hashSeed(P.TREE_NOISE_SEED) % (hi - lo + 1));
}

// Scramble an integer seed into an unrelated 32-bit value.
function hashSeed(seed) {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);

  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  return h >>> 0;
}

// One closed outline per wedge.
function wedgeOutlines(outerR) {
  const outlines = [];

  const count = wedgeCount();

  if (count === 0 || P.WEDGE_WIDTH === 0) return outlines;

  const cx = DESIGN_SIZE / 2;
  const cy = DESIGN_SIZE / 2;

  const n = outerR.length;

  const STEPS = 40;

  // Wedge layout depends only on the seed
  randomSeed(hashSeed(P.TREE_NOISE_SEED * 7 + 2));

  // Spread roughly evenly around the trunk, jittered by up to 35% of
  // the spacing, so no two wedges land on top of each other
  const spacing = TWO_PI / count;
  const offset = random(TWO_PI);

  for (let k = 0; k < count; k++) {
    const jitter = random(-0.35, 0.35) * spacing;
    const angle = (offset + k * spacing + jitter + TWO_PI) % TWO_PI;
    const depth = P.WEDGE_DEPTH * random(0.6, 1);
    const wedgeWidth = P.WEDGE_WIDTH * random(0.6, 1);

    // Open at the last ring; the bark covers the wide end
    const edgeIndex = round((angle / TWO_PI) * n) % n;
    const rEdge = outerR[edgeIndex] + 1;
    const rTip = rEdge * (1 - depth);

    const left = [];
    const right = [];

    for (let s = 0; s <= STEPS; s++) {
      const t = s / STEPS;

      const r = max(0.5, lerp(rTip, rEdge, t));

      // Gentle wander of the crack's centerline, in pixels
      const wander =
        P.WEDGE_JAGGEDNESS * 8 * (2 * noise(k * 13.1, t * 3, 400) - 1);

      const center = angle + wander / r;

      // Each edge is roughened independently
      const halfWidth = (wedgeWidth / 2) * t;

      const leftHalf =
        halfWidth *
        max(
          0,
          1 + 1.2 * P.WEDGE_JAGGEDNESS * (2 * noise(k * 13.1, t * 25, 500) - 1),
        );

      const rightHalf =
        halfWidth *
        max(
          0,
          1 +
            1.2 *
              P.WEDGE_JAGGEDNESS *
              (2 * noise(k * 13.1 + 5, t * 25, 500) - 1),
        );

      left.push({ r, a: center - leftHalf / r });
      right.push({ r, a: center + rightHalf / r });
    }

    const outline = [];

    for (const p of [...left, ...right.reverse()]) {
      outline.push(cx + p.r * cos(p.a), cy + p.r * sin(p.a));
    }

    outlines.push(outline);
  }

  return outlines;
}

// ============================================================
// RESET / REGENERATE
// ============================================================

// Clear the tree back to its first ring.
function resetTree() {
  noiseSeed(P.TREE_NOISE_SEED);

  radii = new Array(P.NUM_VERTICES).fill(P.START_RADIUS);
  rings = [];
  currentRing = 0;

  saveCurrentRing();
}

// Grow every ring at once and fit the finished tree to the canvas.
function growFullTree() {
  resetTree();

  while (currentRing < P.NUM_RINGS) {
    growCurrentRing(currentRing);

    saveCurrentRing();

    currentRing++;
  }

  computeFit();
}

// Restart and animate the growth ring by ring, framed for the
// finished tree so the view doesn't zoom as it grows.
function animateTree() {
  growFullTree();

  resetTree();

  loop();
}

// Build every ring at once and draw the finished tree.
function regenerateTree() {
  growFullTree();

  noLoop();

  redraw();
}

// ============================================================
// GROW CURRENT RING
// ============================================================

function growCurrentRing(ringIndex) {
  for (let i = 0; i < P.NUM_VERTICES; i++) {
    const theta = (TWO_PI * i) / P.NUM_VERTICES;

    // Broad growth variation

    const macro = periodicNoise(
      theta,
      ringIndex * P.MACRO_TIME_SCALE,
      P.MACRO_SCALE,
    );

    // Medium growth variation

    const medium = periodicNoise(
      theta + ringIndex * P.ANGULAR_DRIFT,
      ringIndex * P.MEDIUM_TIME_SCALE,
      P.MEDIUM_SCALE,
    );

    // Combine the two scales

    const variation =
      (1 - P.MEDIUM_STRENGTH) * macro + P.MEDIUM_STRENGTH * medium;

    // Amount this location grows

    const localGrowth =
      P.GROWTH_RATE * max(P.MIN_RING_GAP, 1 + P.IRREGULARITY * variation);

    radii[i] += localGrowth;
  }
}

// ============================================================
// SAVE CURRENT RING
// ============================================================

function saveCurrentRing() {
  rings.push(radii.slice());
}

// ============================================================
// PERIODIC PERLIN NOISE
// ============================================================

// `center` picks a separate region of noise space, so
// independent features don't share the same pattern.
function periodicNoise(theta, timeValue, noiseScale, center = 10) {
  const nx = center + noiseScale * cos(theta);

  const ny = center + noiseScale * sin(theta);

  return 2 * noise(nx, ny, timeValue) - 1;
}

// ============================================================
// SVG EXPORT
//
// Same shapes as the PNG, as vector paths in output-pixel units,
// so the tree prints sharp at any size.
// ============================================================

function exportSVG() {
  const size = outputWidth;

  const gray = (v) => `rgb(${v},${v},${v})`;

  // One closed subpath; holes are reversed like the canvas render
  const subpath = (pts, reverse) => {
    const n = pts.length / 2;
    const parts = [];

    for (let k = 0; k < n; k++) {
      const i = reverse ? n - 1 - k : k;
      const [x, y] = toOutput(pts[2 * i], pts[2 * i + 1], size);

      parts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
    }

    return `M${parts.join("L")}Z`;
  };

  const paths = buildShapes().map(({ outline, hole }) => {
    const d = subpath(outline, false) + (hole ? subpath(hole, true) : "");

    return `<path d="${d}"/>`;
  });

  const background = P.TRANSPARENT
    ? ""
    : `<rect width="${size}" height="${size}" fill="${gray(P.BG_VALUE)}"/>\n`;

  const svg =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n` +
    background +
    `<g fill="${gray(P.STROKE_VALUE)}" fill-rule="evenodd">\n` +
    paths.join("\n") +
    `\n</g>\n</svg>\n`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  link.download = `tree-rings-${size}.svg`;
  link.click();

  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// ============================================================
// CONTROL PANEL
// ============================================================

// Show enough decimals to match the slider's step.
function formatValue(value, step) {
  const decimals = (String(step).split(".")[1] || "").length;

  return Number(value).toFixed(decimals);
}

// A collapsible group of controls. Its open/closed state is
// remembered in this browser.
function createSection(title) {
  const storageKey = `tree-rings-open:${title}`;

  const section = document.createElement("details");
  section.className = "section";

  try {
    section.open = localStorage.getItem(storageKey) === "1";
  } catch {
    // Storage unavailable: start collapsed
  }

  section.addEventListener("toggle", () => {
    try {
      localStorage.setItem(storageKey, section.open ? "1" : "0");
    } catch {
      // Storage unavailable: state just isn't remembered
    }
  });

  const summary = document.createElement("summary");
  summary.textContent = title;
  section.appendChild(summary);

  return section;
}

function buildControls() {
  const panel = document.getElementById("controls");

  const inputs = {};

  // Controls go into the most recent collapsible group
  let section = panel;

  for (const spec of PARAM_SPECS) {
    if (spec.group) {
      section = createSection(spec.group);
      panel.appendChild(section);

      continue;
    }

    if (spec.type === "checkbox") {
      const row = document.createElement("label");
      row.className = "control-checkbox";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = spec.value;

      input.addEventListener("change", () => {
        P[spec.key] = input.checked;

        regenerateTree();
      });

      row.append(input, spec.label);
      section.appendChild(row);

      inputs[spec.key] = { input, spec };

      continue;
    }

    const row = document.createElement("label");
    row.className = "control";

    const name = document.createElement("span");
    name.className = "control-name";
    name.textContent = spec.label;

    const readout = document.createElement("span");
    readout.className = "control-value";
    readout.textContent = formatValue(spec.value, spec.step);

    const input = document.createElement("input");
    input.type = "range";
    input.min = spec.min;
    input.max = spec.max;
    input.step = spec.step;
    input.value = spec.value;

    input.addEventListener("input", () => {
      P[spec.key] = Number(input.value);

      readout.textContent = formatValue(input.value, spec.step);

      regenerateTree();
    });

    row.append(name, readout, input);
    section.appendChild(row);

    inputs[spec.key] = { input, readout, spec };
  }

  // ----- buttons -----

  const buttons = document.createElement("div");
  buttons.className = "buttons";

  const growButton = document.createElement("button");
  growButton.textContent = "Grow";
  growButton.addEventListener("click", animateTree);

  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  resetButton.addEventListener("click", () => {
    for (const { input, readout, spec } of Object.values(inputs)) {
      if (spec.type === "checkbox") {
        input.checked = spec.value;
      } else {
        input.value = spec.value;
        readout.textContent = formatValue(spec.value, spec.step);
      }

      P[spec.key] = spec.value;
    }

    regenerateTree();
  });

  const seedButton = document.createElement("button");
  seedButton.textContent = "Random seed";
  seedButton.addEventListener("click", () => {
    const { input, readout, spec } = inputs.TREE_NOISE_SEED;

    const seed =
      Math.floor(Math.random() * (spec.max - spec.min + 1)) + spec.min;

    input.value = seed;
    readout.textContent = formatValue(seed, spec.step);
    P.TREE_NOISE_SEED = seed;

    regenerateTree();
  });

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save PNG";
  saveButton.addEventListener("click", () =>
    saveCanvas(`tree-rings-${outputWidth}`, "png"),
  );

  const svgButton = document.createElement("button");
  svgButton.textContent = "Save SVG";
  svgButton.addEventListener("click", exportSVG);

  buttons.append(growButton, resetButton, seedButton);

  const saveButtons = document.createElement("div");
  saveButtons.className = "buttons save-buttons";
  saveButtons.append(saveButton, svgButton);

  // ----- width -----

  const widthInput = document.createElement("input");
  widthInput.type = "number";
  widthInput.min = 16;
  widthInput.max = 8000;
  widthInput.value = outputWidth;

  widthInput.addEventListener("change", () => {
    outputWidth = Math.round(
      constrain(Number(widthInput.value) || outputWidth, 16, 8000),
    );

    widthInput.value = outputWidth;

    resizeCanvas(outputWidth, outputWidth);

    updatePixelation();

    regenerateTree();
  });

  const widthRow = document.createElement("label");
  widthRow.className = "width-row";
  widthRow.append("Width", widthInput, "px");

  panel.prepend(buttons, widthRow, saveButtons);
}
