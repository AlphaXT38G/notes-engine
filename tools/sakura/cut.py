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
    "slope": ("hard", 40, 1),
    "knoll": ("hard", 40, 1),
    "tree": ("hard", 40, 1),
    "samurai": ("hard", 40, 1),
    "paper": ("hard", 40, 1),
}
# where the pagoda's storeys are in the valley layer (its walls, under the spire)
PAGODA = (585, 330, 865, 640)
# the paper lanterns lit at night: under the tips of its roofs, and along its balconies
LANTERNS = [(607, 382), (812, 382), (597, 440), (826, 440), (588, 557), (836, 559), (622, 664), (858, 660)] + [(x, y) for y in (412, 506, 626) for x in range(662, 790, 46)]


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


def pagoda_lights(valley):
    """The pagoda's light walls as warm light, for the night"""
    x0, y0, x1, y1 = PAGODA
    lights = Image.new("RGBA", valley.size)
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b, a = valley.getpixel((x, y))
            k = min(r, g, b)
            # the white walls: light, not coloured (not the teal roofs nor the blossoms)
            if a > 220 and k > 165 and max(r, g, b) - k < 45 and r >= b - 4:
                lights.putpixel((x, y), (255, 176, 84, min(255, (k - 165) * 4)))
    # the lanterns: a warm core and its halo
    draw = ImageDraw.Draw(lights)
    for x, y in LANTERNS:
        for r, a in ((7, 45), (4.5, 120), (2.6, 255)):
            draw.ellipse((x - r, y - r * 1.25, x + r, y + r * 1.25), fill=(255, 110 + int(a / 3), 50, a))
    lights.save(OUT / "pagoda-lights.webp", quality=90, alpha_quality=100, method=6)


def tree_veins():
    """The light veins of the great tree at night (skscene.js): a few short lines of light here and
    there on its wood, forking like glowing roots, a soft light escaping from them. Each vein is a
    walker that climbs the bark (what is painted and not a pink blossom), turning towards where
    there is more bark ahead, wavering, forking now and then, stopping where the wood ends; its line
    fades as it goes. Drawn sharp, then a glow around it. A layer of the tree's size, laid over it at
    night."""
    import math
    import random
    rnd = random.Random(7)
    tree = Image.open(OUT / "tree.webp").convert("RGBA")
    w, h = tree.size
    px, al = list(tree.convert("RGB").get_flattened_data()), list(tree.getchannel("A").get_flattened_data())
    bark = Image.new("L", tree.size)
    bark.putdata([255 if a > 230 and not (r > 140 and r - g > 55 and b > g) else 0 for (r, g, b), a in zip(px, al)])
    bark = bark.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(11))  # solid wood: no holes, no lone flowers
    bk = bark.load()
    on = lambda x, y: 0 <= x < w and 0 <= y < h and bk[int(x), int(y)] > 0
    lines = []
    walkers = []
    taken = set()  # the cells (8 px) a vein went through: the others keep apart from it
    # the seeds: a few roots of light, here and there on the wood: two in each band of height, from the
    # limbs at the top to the roots at the foot
    for y0, y1 in ((150, 360), (360, 570), (570, 790), (790, 1010)):
        seeds = 0
        while seeds < 2:
            x, y = rnd.uniform(700, 1530), rnd.uniform(y0, y1)
            if on(x, y):
                walkers.append([x, y, -math.pi / 2 + rnd.uniform(-1.2, 1.2), 0])
                seeds += 1
    while walkers:
        x, y, a, life = walkers.pop()
        pts = [(x, y)]
        for step in range(rnd.randint(30, 95)):  # short
            best, bscore = None, -1
            for da in (-.5, -.25, 0, .25, .5):
                na = a + da + rnd.uniform(-.12, .12)
                score = sum(on(x + math.cos(na) * d, y + math.sin(na) * d) for d in (6, 12, 20)) - abs(da) * .6
                score -= 1.2 * ((int(x + math.cos(na) * 10) >> 3, int(y + math.sin(na) * 10) >> 3) in taken)
                if score > bscore:
                    best, bscore = na, score
            if bscore < 1:
                break
            a = best * .85 + (-math.pi / 2 if y > 300 else a) * .15  # up the trunk, then along the limbs
            x, y = x + math.cos(a) * 4, y + math.sin(a) * 4
            pts.append((x, y))
            if step > 3:
                taken.add((int(pts[-4][0]) >> 3, int(pts[-4][1]) >> 3))
            if rnd.random() < .025 and len(lines) + len(walkers) < 12:  # a fork, now and then, like a root
                walkers.append([x, y, a + rnd.choice((-1, 1)) * rnd.uniform(.5, .9), life + 1])
        if len(pts) > 12:
            lines.append((pts, life))
    core = Image.new("L", tree.size)
    draw = ImageDraw.Draw(core)
    for pts, life in lines:
        n = len(pts)
        for k in range(n - 1):
            fade = math.sin(math.pi * k / n) ** .6 * (.75 ** life)  # fading in and out at both ends
            draw.line([pts[k], pts[k + 1]], fill=int(210 * fade), width=2)
    glow = core.filter(ImageFilter.GaussianBlur(8))  # a soft light escaping from them
    alpha = Image.new("L", tree.size)
    alpha.putdata([min(255, int(c * .9 + g * 2.8)) for c, g in zip(core.get_flattened_data(), glow.get_flattened_data())])
    alpha = Image.composite(alpha, Image.new("L", tree.size), bark.filter(ImageFilter.MaxFilter(9)))
    layer = Image.new("RGBA", tree.size, (255, 200, 230, 0))
    layer.putalpha(alpha)
    layer.save(OUT / "tree-veins.webp", quality=90, alpha_quality=100, method=6)
    print(f"tree-veins: {len(lines)} veins")


def main(names):
    """Cut the layers named (all of them by default): python tools/sakura/cut.py mountains valley"""
    OUT.mkdir(parents=True, exist_ok=True)
    if not names or "sky" in names:
        Image.open(SRC / "sky.webp").convert("RGB").save(OUT / "sky.webp", quality=82, method=6)
    done = {name: cut(name, *spec) for name, spec in LAYERS.items() if not names or name in names}
    if "valley" in done:
        pagoda_lights(done["valley"])
    if not names or "veins" in names or "tree" in names:
        tree_veins()


if __name__ == "__main__":
    main(sys.argv[1:])
