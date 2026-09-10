"""Pixel avatar — OMORI-ish game-character, with glasses."""
from PIL import Image, ImageDraw
import random
W, H, SCALE = 64, 80, 9
random.seed(4)
img = Image.new("RGB", (W, H), (93, 79, 123)); d = ImageDraw.Draw(img)
BG=(93,79,123); BG_HI=(110,94,144)
SKIN=(245,230,216); SKIN_SH=(229,208,193)
BLUSH=(235,159,177)
HAIR=(24,20,31); HAIR_HI=(42,36,52)
HOODIE=(38,34,47); HOODIE_HI=(55,50,67); HOOD_IN=(21,18,27)
FRAME=(13,11,18); LENS=(151,216,207)
EYE=(15,12,20); WHITE=(248,251,251)
def box(a,b,c,e,col):
    a,c=sorted((a,c)); b,e=sorted((b,e)); d.rectangle([a,b,c,e],fill=col)
def ell(a,b,c,e,col): d.ellipse([a,b,c,e],fill=col)
def poly(p,col): d.polygon(p,fill=col)

ell(-16,-12,W+16,H-2,BG_HI); ell(2,30,W-2,H+34,BG)

# hoodie
ell(-6,54,W+6,H+22,HOODIE); box(0,70,W,H,HOODIE)
poly([(19,56),(45,56),(32,80)],HOOD_IN)
box(6,60,W-6,64,HOODIE_HI)
box(23,56,25,72,HOODIE_HI); box(39,56,41,71,HOODIE_HI)

# neck
box(28,50,36,60,SKIN_SH); box(29,49,35,56,SKIN)

# head  (big, fills the frame)
ell(12,8,52,58,SKIN)
ell(13,30,24,55,SKIN_SH)                     # soft left shade

# ears
box(12,32,16,41,SKIN_SH); box(48,32,52,41,SKIN_SH)

# --- hair: a crown on top, short sides, wispy fringe ---
ell(9,0,55,26,HAIR)                          # crown (top ~26px only)
box(11,4,53,16,HAIR)
box(11,14,16,40,HAIR); box(48,14,53,40,HAIR) # short sides, frame the face
poly([(9,6),(14,3),(11,18)],HAIR)            # flicks
poly([(55,6),(50,3),(53,18)],HAIR)
poly([(29,-2),(35,-2),(34,4),(30,4)],HAIR)   # cowlick
box(18,3,34,5,HAIR_HI)                        # sheen

# fringe wisps — short, top of the forehead only (y11..~21)
fx = 12
while fx < 52:
    w = random.choice([3,4,5]); L = random.choice([5,7,10,6,8])
    poly([(fx,11),(fx+w,11),(fx+w//2,11+L)],HAIR)
    fx += w-1
# three longer strands (between/beside the eyes) reaching toward the glasses
poly([(22,11),(25,11),(23,28)],HAIR)
poly([(39,11),(42,11),(41,28)],HAIR)
poly([(31,10),(34,10),(32,24)],HAIR)

# blush
ell(18,41,25,45,BLUSH); ell(39,41,46,45,BLUSH)

# eyes (small dots)
box(23,35,26,39,EYE); box(38,35,41,39,EYE)
box(23,35,24,36,WHITE); box(38,35,39,36,WHITE)

# nose + blank "..." mouth
box(31,41,32,43,SKIN_SH)
box(29,48,30,49,EYE); box(32,48,33,49,EYE); box(35,48,36,49,EYE)

# glasses — round frames over the eyes
def lens(cx,cy):
    ell(cx-6,cy-5,cx+6,cy+5,LENS)
    d.ellipse([cx-6,cy-5,cx+6,cy+5],outline=FRAME,width=1)
    box(cx-4,cy-3,cx-2,cy-1,WHITE)
LX,RX,GY = 24, 40, 37
lens(LX,GY); lens(RX,GY)
box(LX+6,GY-1,RX-6,GY+1,FRAME)
box(14,GY-1,LX-6,GY,FRAME)
box(RX+6,GY-1,51,GY,FRAME)

# scanlines
sl=Image.new("RGBA",(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sl)
for y in range(0,H,3): sd.line([(0,y),(W,y)],fill=(0,0,0,16))
img=Image.alpha_composite(img.convert("RGBA"),sl).convert("RGB")
img.resize((W*SCALE,H*SCALE),Image.NEAREST).save("public/images/profile/daniel.png")
print("saved")
