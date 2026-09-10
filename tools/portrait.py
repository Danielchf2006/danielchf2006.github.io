from PIL import Image, ImageDraw
W,H,SCALE=64,80,9
img=Image.new("RGB",(W,H),(18,16,27)); d=ImageDraw.Draw(img)
BG=(18,16,27); GLOW=(36,27,60)
SKIN=(231,189,151); SKIN_SH=(203,157,121); SKIN_HI=(246,215,183)
HAIR=(33,28,46); HAIR_HI=(60,52,84)
HOODIE=(110,52,226); HOODIE_SH=(66,30,140); HOOD_IN=(24,18,42)
FRAME=(9,9,15); LENS=(74,218,198); GLINT=(214,255,251)
OUT=(11,11,17); MOUTH=(162,106,106)
def box(a,b,c,e,col):
    a,c=sorted((a,c)); b,e=sorted((b,e)); d.rectangle([a,b,c,e],fill=col)
def ell(a,b,c,e,col): d.ellipse([a,b,c,e],fill=col)
def poly(p,col): d.polygon(p,fill=col)

ell(3,1,W-3,56,GLOW); box(0,30,W,H,BG)

# hoodie
ell(0,58,W,H+24,HOODIE); box(0,72,W,H,HOODIE)
poly([(23,63),(41,63),(32,80)],HOOD_IN)
ell(0,60,22,H+24,HOODIE_SH)
box(30,70,31,78,(210,205,225)); box(37,70,38,77,(210,205,225))  # drawstrings

# neck
box(28,48,36,62,SKIN_SH); box(29,47,35,57,SKIN)

# hair backdrop
ell(13,3,51,40,HAIR)
box(16,8,20,9,HAIR_HI); box(22,6,38,8,HAIR_HI)   # crown sheen

# face
ell(15,11,49,52,SKIN)
ell(16,24,27,49,SKIN_SH)                # soft left cheek shadow (inside)
box(26,15,40,17,SKIN_HI)                # forehead highlight

# ears
box(15,30,18,39,SKIN_SH); box(16,31,18,37,SKIN)
box(46,30,49,39,SKIN_SH); box(46,31,48,37,SKIN)

# hairline — curved cap + a soft parted fringe
ell(13,-2,51,20,HAIR)
box(15,8,19,22,HAIR); box(45,8,49,22,HAIR)     # short temples
ell(22,2,42,17,SKIN)                            # lift centre hairline
poly([(24,10),(31,10),(27,17),(23,15)],HAIR)   # left fringe wisp
poly([(33,10),(41,10),(41,16),(34,17)],HAIR)   # right fringe wisp
box(26,13,38,15,SKIN_HI)

# brows
box(23,28,30,30,HAIR); box(35,28,42,30,HAIR)
# eyes
box(25,32,28,35,OUT); box(37,32,40,35,OUT)
# nose
box(31,35,33,41,SKIN_SH); box(30,41,34,43,SKIN_SH)
# mouth
box(28,45,37,47,MOUTH); box(29,47,36,48,SKIN_SH)

# glasses
def lens(x0,y0):
    x1,y1=x0+12,y0+9
    box(x0+1,y0+1,x1-1,y1-1,LENS)
    d.rectangle([x0,y0,x1,y1],outline=FRAME,width=1)
    d.rectangle([x0+1,y0+1,x1-1,y1-1],outline=FRAME,width=1)
    box(x0+2,y0+2,x0+4,y0+3,GLINT)
LX,RX,GY=19,33,29
lens(LX,GY); lens(RX,GY)
box(LX+12,GY+3,RX,GY+5,FRAME)
box(16,GY+3,LX,GY+5,FRAME)
box(RX+12,GY+3,49,GY+5,FRAME)

# scanlines
sl=Image.new("RGBA",(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sl)
for y in range(0,H,3): sd.line([(0,y),(W,y)],fill=(0,0,0,18))
box(28,50,36,52,SKIN)  # fuller jaw
img=Image.alpha_composite(img.convert("RGBA"),sl).convert("RGB")
img.resize((W*SCALE,H*SCALE),Image.NEAREST).save("/private/tmp/claude-501/-Users-danielcai-Downloads-App-Resume-creative-space/beaa00d7-91fe-4acb-a544-866c1c6784aa/scratchpad/daniel.png")
print("ok")
