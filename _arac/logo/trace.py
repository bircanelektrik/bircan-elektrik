import sys, numpy as np, potrace
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGBA')
a = np.array(im).astype(float)
# black strokes on white (or transparent): ink = dark & opaque
lum = (a[...,0]*.299+a[...,1]*.587+a[...,2]*.114)
ink = (lum < 128) & (a[...,3] > 128)
ys, xs = np.where(ink)
print('bbox', xs.min(), ys.min(), xs.max(), ys.max(), file=sys.stderr)
bm = potrace.Bitmap(ink)
path = bm.trace(turdsize=10, alphamax=1.0, opticurve=True, opttolerance=0.2)
parts=[]
for curve in path:
    s = curve.start_point
    d = [f"M{s.x:.1f} {s.y:.1f}"]
    for seg in curve.segments:
        if seg.is_corner:
            d.append(f"L{seg.c.x:.1f} {seg.c.y:.1f}L{seg.end_point.x:.1f} {seg.end_point.y:.1f}")
        else:
            d.append(f"C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}")
    d.append("Z")
    parts.append("".join(d))
x0,y0,x1,y1 = xs.min()-4, ys.min()-4, xs.max()+4, ys.max()+4
print(f'{x0} {y0} {x1-x0} {y1-y0}')
print("".join(parts))
