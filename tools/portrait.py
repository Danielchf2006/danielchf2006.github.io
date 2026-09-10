"""Pixel avatar — clean cyber-noir style with glasses. Matches the site palette."""
from PIL import Image, ImageDraw
W, H, SCALE = 64, 80, 9
img = Image.new("RGB", (W, H), (58, 50, 78)); d = ImageDraw.Draw(img)
BG=(58,50,78); BG_HI=(74,64,98)
SKIN=(231,189,151); SKIN_SH=(203,158,122); SKIN_HI=(244,213,181)
HAIR=(26,22,34); HAIR_HI=(47,41,61)
HOODIE=(108,51,224); HOODIE_SH=(70,32,150); HOOD_IN=(30,24,48)
FRAME=(11,10,16); LENS=(74,216,196); GLINT=(216,255,251)
EYE=(15,12,19); MOUTH=(160,104,104)
def box(a,b,c,e,col):
    a,c=sorted((a,c)); b,e=sorted((b,e)); d.rectangle([a,b,c,e],fill=col)
def ell(a,b,c,e,col): d.ellipse([a,b,c,e],fill=col)
def poly(p,col): d.polygon(p,fill=col)

ell(-14,-10,W+14,H-2,BG_HI); ell(2,30,W-2,H+32,BG)

# hoodie
ell(-4,55,W+4,H+22,HOODIE); box(0,71,W,H,HOODIE)
poly([(20,57),(44,57),(32,80)],HOOD_IN)
ell(-4,57,20,H+22,HOODIE_SH)

# neck
box(28,49,36,60,SKIN_SH); box(29,48,35,56,SKIN)

# head
ell(14,12,50,56,SKIN)
ell(15,28,25,54,SKIN_SH)

# ears
box(14,31,17,40,SKIN_SH); box(47,31,50,40,SKIN_SH)

# --- hair: a cap on top, short sides, few fringe wisps ---
ell(10,0,54,26,HAIR)                         # rounded cap
box(12,12,16,33,HAIR); box(48,12,52,33,HAIR) # short side strands
poly([(9,7),(14,3),(11,18)],HAIR)            # stray flicks
poly([(55,7),(50,3),(53,18)],HAIR)
box(20,4,34,6,HAIR_HI); box(24,9,30,11,HAIR_HI)   # sheen streaks
poly([(21,18),(26,18),(24,24)],HAIR)         # 2 soft fringe wisps
poly([(36,18),(41,18),(39,25)],HAIR)

# brows
box(23,30,30,32,HAIR); box(35,30,42,32,HAIR)

# eyes
box(24,34,29,38,SKIN); box(25,34,28,37,EYE); box(25,34,26,35,GLINT)
box(37,34,42,38,SKIN); box(38,34,41,37,EYE); box(38,34,39,35,GLINT)

# nose + mouth
box(31,38,33,43,SKIN_SH); box(30,43,34,45,SKIN_SH)
box(28,48,37,50,MOUTH); box(29,50,36,51,SKIN_SH)

# glasses — rectangular teal frames, over the eyes
def lens(x0,y0):
    x1,y1 = x0+13,y0+9
    box(x0+1,y0+1,x1-1,y1-1,LENS)
    d.rectangle([x0,y0,x1,y1],outline=FRAME,width=1)
    box(x0+2,y0+2,x0+4,y0+3,GLINT)
LX,RX,GY = 20,33,33
lens(LX,GY); lens(RX,GY)
box(LX+13,GY+3,RX,GY+5,FRAME)
box(15,GY+3,LX,GY+5,FRAME)
box(RX+13,GY+3,50,GY+5,FRAME)

# scanlines
sl=Image.new("RGBA",(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sl)
for y in range(0,H,3): sd.line([(0,y),(W,y)],fill=(0,0,0,18))
img=Image.alpha_composite(img.convert("RGBA"),sl).convert("RGB")
img.resize((W*SCALE,H*SCALE),Image.NEAREST).save("public/images/profile/daniel.png")
print("saved")
