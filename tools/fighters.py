"""Pixel Ryu vs Ken facing off with a hadouken — for the homepage 'crazy about' strip."""
from PIL import Image, ImageDraw
W, H, SCALE = 132, 66, 6
img = Image.new("RGBA", (W, H), (0,0,0,0)); d = ImageDraw.Draw(img)

GI_W   = (238, 236, 228)   # Ryu white gi
GI_W_S = (198, 198, 192)
GI_R   = (196, 44, 44)     # Ken red gi
GI_R_S = (150, 28, 28)
SKIN   = (230, 178, 132)
SKIN_S = (196, 142, 100)
HAIR_K = (238, 190, 60)    # Ken blonde
HAIR_R = (30, 26, 24)      # Ryu dark
BELT   = (120, 84, 44)
BAND   = (200, 40, 40)     # Ryu headband
OUT    = (14, 12, 18)
HAD1   = (120, 220, 255)
HAD2   = (60, 150, 240)
HAD3   = (235, 250, 255)

def box(a,b,c,e,col): d.rectangle([a,b,c,e], fill=col)
def ell(a,b,c,e,col): d.ellipse([a,b,c,e], fill=col)
def out(a,b,c,e): d.rectangle([a,b,c,e], outline=OUT, width=1)

# ================= RYU (left, facing right) =================
ox = 6
# back leg (left) + front leg (right), wide stance
box(ox+2, 46, ox+9, 62, GI_W); box(ox+2,46,ox+9,62 and 62, GI_W)
box(ox+2, 58, ox+10, 62, GI_W_S)
box(ox+14, 44, ox+21, 60, GI_W); box(ox+14, 56, ox+22, 60, GI_W_S)
box(ox+1, 61, ox+9, 64, SKIN)     # back foot
box(ox+15, 59, ox+23, 63, SKIN)   # front foot
# belt
box(ox+3, 42, ox+20, 46, BELT)
# torso / gi top
box(ox+4, 26, ox+19, 44, GI_W)
box(ox+4, 26, ox+8, 44, GI_W_S)   # shade
d.polygon([(ox+11,26),(ox+15,26),(ox+13,40)], fill=GI_W_S)  # gi fold
# back arm (bent, near body)
box(ox+2, 28, ox+6, 40, GI_W); box(ox+1, 36, ox+5, 42, SKIN)
# front arm — big forward punch toward Ken
box(ox+16, 30, ox+30, 36, GI_W)
box(ox+28, 29, ox+37, 37, SKIN)   # forearm
box(ox+34, 27, ox+43, 39, SKIN)   # fist
box(ox+34, 27, ox+37, 39, SKIN_S)
# head
box(ox+9, 14, ox+20, 26, SKIN)
box(ox+9, 14, ox+13, 26, SKIN_S)
# hair + headband
box(ox+8, 11, ox+21, 16, HAIR_R)
box(ox+7, 15, ox+22, 18, BAND)
d.polygon([(ox+6,16),(ox+2,13),(ox+3,20)], fill=BAND)   # headband tail
d.polygon([(ox+6,17),(ox+1,18),(ox+3,23)], fill=BAND)
box(ox+17, 19, ox+19, 21, OUT)   # eye
d.line([(ox+8,26),(ox+20,26)], fill=SKIN_S)

# ================= KEN (right, facing left) =================
kx = W - 6
box(kx-9, 46, kx-2, 62, GI_R); box(kx-10, 58, kx-2, 62, GI_R_S)
box(kx-21, 44, kx-14, 60, GI_R); box(kx-22, 56, kx-14, 60, GI_R_S)
box(kx-9, 61, kx-1, 64, SKIN)
box(kx-23, 59, kx-15, 63, SKIN)
box(kx-20, 42, kx-3, 46, BELT)
box(kx-19, 26, kx-4, 44, GI_R)
box(kx-9, 26, kx-4, 44, GI_R_S)
d.polygon([(kx-15,26),(kx-11,26),(kx-13,40)], fill=GI_R_S)
# back arm raised
box(kx-6, 22, kx-2, 34, GI_R); box(kx-5, 18, kx-1, 26, SKIN)
# front arm guarding low toward Ryu
box(kx-30, 32, kx-16, 38, GI_R)
box(kx-37, 33, kx-28, 40, SKIN)
box(kx-44, 33, kx-35, 44, SKIN); box(kx-38, 33, kx-35, 44, SKIN_S)  # fist
# head
box(kx-20, 14, kx-9, 26, SKIN); box(kx-14, 14, kx-9, 26, SKIN_S)
# blonde spikes
for sx,sh in [(-22,-3),(-18,-6),(-14,-7),(-10,-6),(-6,-3)]:
    d.polygon([(kx+sx,14),(kx+sx+4,14),(kx+sx+2,9+sh)], fill=HAIR_K)
box(kx-22, 11, kx-7, 16, HAIR_K)
box(kx-19, 19, kx-17, 21, OUT)

# ================= HADOUKEN =================
cx, cy = W//2 + 2, 34
ell(cx-13, cy-11, cx+13, cy+11, HAD2)
ell(cx-10, cy-8, cx+10, cy+8, HAD1)
ell(cx-5, cy-4, cx+5, cy+4, HAD3)
# trailing streaks
for r in range(3):
    box(cx-18-r*3, cy-1, cx-14-r*3, cy+1, HAD1)
d.line([(cx-1,cy-14),(cx+2,cy+14)], fill=HAD3)

img.resize((W*SCALE, H*SCALE), Image.NEAREST).save("public/images/obsession/fighters.png")
print("saved", (W*SCALE, H*SCALE))
