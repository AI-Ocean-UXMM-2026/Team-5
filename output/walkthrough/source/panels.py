# Adds a "panel" box to each modal shot: the dialog is the only pure-white area once the page behind it is dimmed.
import json, sys
import numpy as np
from PIL import Image
for d in sys.argv[1:]:
    mf = f"{d}/manifest.json"; m = json.load(open(mf))
    for name, s in m.items():
        if not s["boxes"].get("dialog"): continue
        a = np.asarray(Image.open(f"{d}/{name}.png").convert("L"))
        ys, xs = np.nonzero(a > 246)
        # ignore stray bright pixels: keep the dense block
        x0, x1 = np.percentile(xs, [0.5, 99.5]).astype(int); y0, y1 = np.percentile(ys, [0.5, 99.5]).astype(int)
        panel = [int(x0 // 2), int(y0 // 2) + s["scroll"], int((x1 - x0) // 2), int((y1 - y0) // 2)]
        s["boxes"]["panel"] = panel
        print(d, name, panel)
    json.dump(m, open(mf, "w"), indent=1)
