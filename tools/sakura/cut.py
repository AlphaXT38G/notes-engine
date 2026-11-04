"""Cut the painted layers of the sakura screens (notes_engine/site/js/skscene.js) out of their light backgrounds.

The layers in src/ were painted by an image generator on a flat light grey (247, 247, 247), not on
transparency. Each one becomes a WebP with alpha in notes_engine/site/img/sakura/:
  - the background reached from the image's border (a flood fill) becomes transparent; a "soft"
    layer (the far mountains, the valley) keeps its mist there as semi-transparent haze (colour to
    alpha: how far a pixel is from the background colour is its opacity, and its colour is
    un-mixed from the grey), a "hard" layer (the tree, the samurai...) keeps a crisp outline, only
    its rim anti-aliased that way;
  - the holes the fill cannot reach (sky seen between the blossoms, between an arm and the body)
    go too: pixels of the background's neutral grey, wherever they are;
  - the sky has no background to cut: it is only converted.
From the valley layer it also makes pagoda-lights.webp: the pagoda's white walls turned into warm
light, shown at night over the valley (css/sakura.css). Run it from the repository root (needs
Pillow):

    python tools/sakura/cut.py              (every layer)
    python tools/sakura/cut.py mountains valley   (only these; also sky, dragon, veins)
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).parent
SRC = HERE / "src"
OUT = HERE.parent.parent / "notes_engine" / "site" / "img" / "sakura"
BG = (247, 247, 247)
MARK = (255, 0, 254)  # the flood fill's colour, found nowhere in the paintings
# layer: (mode, flood tolerance: the sum of the channels' differences from the background, gain:
# how much more opaque the soft parts are made, so the far mountains are not washed out, and
# holes_too: whether the background's grey inside the painting goes too, True by default)
LAYERS = {
    # the far mountains: cut crisply (they are pale, a soft cut would make them see-through),
    # without holes (their snow is as white as the background), their rim keeping its colour
    "mountains": ("hard", 9, 1, False),
    "valley": ("soft", 90, 1.35),
}
def to_alpha(c, gain=1, keep=False):
    """Colour to alpha against BG: the opacity a pixel needs over BG, and its own colour (more
    opaque by gain: the colour is then un-mixed less, nearer the background's). keep: the pixel
    keeps its painted colour (haze and mist stay as light as painted, never un-mixed into
    saturated fringes)"""
    a = 0.0
    for v, b in zip(c, BG):
        a = max(a, (v - b) / (255 - b) if v > b else (b - v) / b)
    # a dead zone first: the faint noise around the paintings (the source's compression, a few
    # levels off the background) must stay fully transparent, not become a haze of squares
    if gain > 1:
        a = max(0.0, a - 0.07) / 0.93
    a = min(1.0, a * gain)
    if a <= 0.004:
        return (0, 0, 0, 0)
    if keep:
        return tuple(c) + (round(a * 255),)
    rgb = tuple(max(0, min(255, round((v - b) / a + b))) for v, b in zip(c, BG))
    return rgb + (round(a * 255),)


def background(im, tol):
    """The background reached from the border: a mask, 255 where it is."""
    fill = im.copy()
    w, h = im.size
    border = [(x, 0) for x in range(0, w, 4)] + [(x, h - 1) for x in range(0, w, 4)] + \
        [(0, y) for y in range(0, h, 4)] + [(w - 1, y) for y in range(0, h, 4)]
    for p in border:
        c = fill.getpixel(p)
        if c != MARK and sum(abs(v - b) for v, b in zip(c, BG)) < tol:
            ImageDraw.floodfill(fill, p, MARK, thresh=tol)
    return Image.eval(Image.merge("RGB", [fill.getchannel(i).point(lambda v, m=m: 255 if v == m else 0) for i, m in enumerate(MARK)]).convert("L"), lambda v: 255 if v == 255 else 0)


def cut(name, mode, tol, gain, holes_too=True):
    im = Image.open(SRC / f"{name}.webp").convert("RGB")
    bg = background(im, tol)
    px, bgp = list(im.get_flattened_data()), list(bg.get_flattened_data())
    # the holes: the background's neutral grey where the fill did not reach
    holes = Image.new("L", im.size)
    holes.putdata([255 if b or holes_too and (max(c) - min(c) <= 6 and min(c) >= 234) else 0 for c, b in zip(px, bgp)])
    # the rim: two pixels into the painting around the background and the holes, where the
    # painting's light halo meets it, anti-aliased by colour to alpha
    rimp = list(holes.filter(ImageFilter.MaxFilter(5)).get_flattened_data())
    holep = list(holes.get_flattened_data())
    # the haze of a soft layer is cut from a blurred copy: the source's compression blocks, unseen
    # on its light background, would show as a grid of squares over the sky once it is see-through
    soft = list(im.filter(ImageFilter.GaussianBlur(2.2)).get_flattened_data()) if mode == "soft" else px
    out = []
    for c, sc, b, h, r in zip(px, soft, bgp, holep, rimp):
        if b and mode == "hard":
            out.append((0, 0, 0, 0))
        elif h or r:
            out.append(to_alpha(sc if b else c, gain if b else 1, keep=mode == "soft" or not holes_too))
        else:
            out.append(c + (255,))
    res = Image.new("RGBA", im.size)
    res.putdata(out)
    if mode == "soft":
        # the valley: its outline pulled in by a pixel, so the light rim the painting has against
        # the white (the pagoda's roofs, the ridges) does not show over the dark sky of the night
        res.putalpha(res.getchannel("A").filter(ImageFilter.MinFilter(3)))
    if not holes_too:
        # the far mountains: their outline pulled in by a pixel, softened, so the light line the
        # painting has along the ridges (its anti-aliasing against the white) does not show
        res.putalpha(res.getchannel("A").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7)))
    # the alpha is saved without loss (lossy alpha makes blocks in the mist); the colour at quality 90
    res.save(OUT / f"{name}.webp", quality=90, alpha_quality=100, method=6, exact=True)
    print(f"{name}: {res.size[0]}x{res.size[1]}")
    return res


def main(names):
    """Cut the layers named (all of them by default): python tools/sakura/cut.py mountains valley"""
    OUT.mkdir(parents=True, exist_ok=True)
    if not names or "sky" in names:
        Image.open(SRC / "sky.webp").convert("RGB").save(OUT / "sky.webp", quality=82, method=6)
    done = {name: cut(name, *spec) for name, spec in LAYERS.items() if not names or name in names}


if __name__ == "__main__":
    main(sys.argv[1:])
