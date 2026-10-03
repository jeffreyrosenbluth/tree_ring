# Tree Rings

A generative drawing of a tree's cross-section: growth rings, bark and radial
splits (wedge checks). Every setting is a slider, and the result can be saved as
a PNG or an SVG at any size. The defaults are tuned for a small black-and-white
illustration, about 512 px or a 1.5–2 inch print.

Built with [p5.js](https://p5js.org/). Nothing to install or build.

---

## Running it

You need a web browser and an internet connection, because p5.js loads from a
CDN.

### Option 1: open the file

Double-click `index.html`, or drag it into a browser window.

### Option 2: run a local server

If the page doesn't load when you open it directly, serve the folder instead.
From inside the project folder:

```sh
python3 -m http.server 8000
```

Then go to <http://localhost:8000/>. Press `Ctrl+C` in the terminal to stop the
server.

If you have Node.js instead of Python, `npx serve` works too.

---

## Quick start

1. Open the app. A tree grows ring by ring.
2. Click **Random seed** a few times until you find a tree you like.
3. Open the sections in the panel to adjust the look. The image redraws as you
   drag a slider.
4. Set **Width** to the size you need, then click **Save PNG** or **Save SVG**.

To get back a tree you liked, note its **Noise seed** (in **Appearance**). The
same seed with the same settings always gives the same tree.

---

## Top controls

| Control | What it does |
|---|---|
| **Grow** | Replays the growth animation, one ring at a time. |
| **Reset** | Puts every slider back to its default. Width is not changed. |
| **Random seed** | Picks a new random seed, which gives a new tree shape, bark and split layout. Your other settings are kept. |
| **Width** | Output size in pixels. The image is always square, so height equals width. Allowed range 16–8000. Press Enter or click away to apply. |
| **Save PNG** | Downloads the image at exactly Width × Width pixels. |
| **Save SVG** | Downloads the same drawing as vector shapes, which print sharp at any size. Best choice for print. |

The canvas always takes up the same space on screen, whatever the Width. For
small widths you see the actual pixels enlarged, so what you see is what the PNG
will contain.

### Printing

- **SVG** is the best choice for print. It scales to any size without losing
  sharpness.
- **PNG**: set Width to the printed size in inches × 300. For example, use 600 px
  for a 2 inch image at 300 dpi.

---

## How sizes work

The tree is **always scaled to fill the canvas**, less the margin. Sliders like
Growth rate, Line weight, Bark thickness and Wedge width therefore don't change
how big the tree is. They change its **proportions**: how thick the lines, bark
and splits are relative to the spacing between rings.

The one exception is **Min width (px)**, which is measured in real output pixels.

---

## Parameters

The panel is split into collapsible sections. Click a heading to open or close
it. The browser remembers which sections you left open.

### Structure

| Parameter | Default | What it does |
|---|---|---|
| **Vertices** | 400 | Points around each ring. More gives smoother curves; fewer gives a faceted look. Rarely needs changing. |
| **Rings** | 35 | Number of growth rings. Fewer gives a bolder image that holds up at small sizes; more gives finer detail but can turn gray when printed small. |
| **Start radius** | 5 | Size of the center (the pith) before the first ring. |
| **Growth rate** | 7 | Average spacing between rings. Higher makes the lines, bark and splits look thinner relative to the gaps. |

### Overall irregularity

| Parameter | Default | What it does |
|---|---|---|
| **Irregularity** | 0.8 | How lopsided the growth is. 0 gives perfect circles. Around 0.5–1.2 looks natural. Higher gives strongly off-center growth. |
| **Min ring gap** | 0.35 | The least any spot can grow in a year, as a fraction of the growth rate. Stops rings from pinching together into dark patches. Lower allows tighter bunching; 1 gives even spacing. |

### Large-scale shape

The broad bulges and flat sides of the trunk.

| Parameter | Default | What it does |
|---|---|---|
| **Scale** | 0.75 | Size of the bulges. Smaller gives a few broad lobes; larger gives many small ones. |
| **Time scale** | 0.045 | How quickly the bulge pattern changes from ring to ring. Smaller keeps the same lopsided shape throughout the tree's life; larger makes it shift as the tree grows. |

### Medium-scale shape

A second, finer layer of waviness on top of the large shape.

| Parameter | Default | What it does |
|---|---|---|
| **Strength** | 0.5 | Mix between the two layers. 0 uses only the large shape; 1 uses only the medium waviness. |
| **Scale** | 1.5 | Size of the medium waves. Larger gives more, smaller wiggles. |
| **Time scale** | 0.055 | How quickly the medium waves change from ring to ring. |
| **Angular drift** | 0.022 | How much the waves slide around the circle from ring to ring, which gives a slight swirl. 0 keeps them in place. |

### Ring lines

| Parameter | Default | What it does |
|---|---|---|
| **Line weight** | 2.2 | Average thickness of the ring lines. |
| **Ring-to-ring variation** | 0.8 | How much whole rings differ, some bold and some faint, like the dark bands in real wood. 0 makes every ring the same thickness. |
| **Along-ring variation** | 0.8 | How much each line swells and thins as it goes around. Above about 1, lines start to break into dashes. |
| **Along-ring scale** | 2.5 | How often a line swells and thins. Smaller gives long, gradual changes; larger gives quick ones. |
| **Min width (px)** | 0.5 | Thinnest a line can get, in real output pixels, so faint lines stay solid instead of fading to gray. Deliberate breaks are kept. Above about 1 it starts flattening the bold/faint contrast. |

### Bark

| Parameter | Default | What it does |
|---|---|---|
| **Thickness** | 14 | Width of the dark bark band around the outside. 0 removes the bark. |
| **Roughness** | 0.5 | How uneven the bark's outer edge is. 0 gives an even band. |
| **Roughness scale** | 6 | Size of the bumps. Smaller gives broad lumps; larger gives fine, jagged texture. |
| **Notches** | 6 | Number of small V-shaped cuts in the bark's edge. |

### Wedge splits

Dark radial cracks that start at the bark and narrow toward the center. The
bark itself never splits.

| Parameter | Default | What it does |
|---|---|---|
| **Min count** | 3 | Fewest splits. |
| **Max count** | 4 | Most splits. The seed picks a number between Min and Max. Set both to the same value for an exact count. |
| **Width** | 16 | How wide each split is at the bark. Each split varies a little from this. |
| **Depth** | 0.75 | How far the splits reach toward the center. 1 goes all the way to the pith. Each split varies a little. |
| **Jaggedness** | 0.5 | How rough and wandering the split edges are. 0 gives clean, straight wedges. |

Splits are spread roughly evenly around the trunk, so they never land on top of
each other.

### Appearance

| Parameter | Default | What it does |
|---|---|---|
| **Margin (%)** | 5 | Empty space around the tree, as a percentage of the width on each side. |
| **Transparent background** | off | Saves PNG and SVG without a background, so the image blends with a tinted page. A checkerboard shows behind the canvas when it's on. |
| **Background** | 255 | Background gray level, from 0 (black) to 255 (white). Ignored when Transparent background is on. |
| **Stroke** | 0 | Gray level of the rings, bark and splits, from 0 (black) to 255 (white). |
| **Supersampling** | 4 | Draws the image this many times larger and then shrinks it, for smoother edges in the PNG. 1 turns it off. Has no effect on SVG. Capped automatically for very large widths. |
| **Noise seed** | 19 | The random seed. Each number gives a different tree shape, bark and split layout. **Random seed** sets this for you. |

---

## Tips for small or printed images

- **Thin rings turn to gray when printed small.** Use fewer rings, or raise Line
  weight, until individual rings are clearly visible at the final size.
- Keep **Min ring gap** around 0.3–0.5 to avoid dark, crowded patches.
- Bark **Notches** are mostly invisible below about 512 px. Turn them down if the
  edge looks noisy.
- Two to four deep splits read better at small sizes than many short ones.
- Check the canvas at the actual Width you'll use. It shows the real pixels.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | The page. Loads p5.js and the sketch. |
| `sketch.js` | All of the drawing code and the parameter definitions. |
| `style.css` | Layout and control-panel styling. |

Defaults, ranges and labels for every slider are in the `PARAM_SPECS` list at
the top of `sketch.js`. Edit a value there to change a default.
