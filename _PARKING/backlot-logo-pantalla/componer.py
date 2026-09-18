import cv2, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter

A=json.load(open('/tmp/track/denso.json')); B=json.load(open('/tmp/track/densoB.json'))
N=357
# 1. puntos fiables
fs,cx,cy,ww=[],[],[],[]
for i in range(N):
    a,b=A[i],B[i]; p=a if a['score']>=b['score'] else b
    if p['score']>0.85:
        fs.append(i); cx.append(p['x']+p['w']/2); cy.append(p['y']+p['h']/2); ww.append(p['w'])
fs=np.array(fs,float)
todos=np.arange(N,dtype=float)
# 2. interpolar huecos y suavizar (la camara es un dron: nada brusco)
def suave(v):
    y=np.interp(todos, fs, np.array(v,float))
    k=np.ones(25)/25.0
    return np.convolve(np.pad(y,(12,12),mode='edge'), k, mode='valid')[:N]
CX,CY,WW=suave(cx),suave(cy),suave(ww)
RATIO=112/340.0
HH=WW*RATIO

logo=Image.open('/tmp/logo_sceneme.png').convert('RGBA')

def panel(w,h):
    """Fondo de marca para la pantalla LED: degradado noche + halo dorado y logo."""
    w,h=max(int(w),8),max(int(h),8)
    g=np.zeros((h,w,4),np.uint8)
    yy=np.linspace(0,1,h)[:,None]
    xx=np.linspace(-1,1,w)[None,:]
    # degradado vertical azul noche -> casi negro
    g[...,0]=(12+26*(1-yy)).astype(np.uint8)          # R
    g[...,1]=(18+40*(1-yy)).astype(np.uint8)          # G
    g[...,2]=(34+74*(1-yy)).astype(np.uint8)          # B
    # halo dorado suave al centro, para que el logo no flote sobre plano
    r=np.sqrt(xx**2+((yy-0.5)*2)**2)
    halo=np.clip(1-r/1.15,0,1)**2
    g[...,0]=np.clip(g[...,0]+halo*70,0,255).astype(np.uint8)
    g[...,1]=np.clip(g[...,1]+halo*52,0,255).astype(np.uint8)
    g[...,2]=np.clip(g[...,2]+halo*16,0,255).astype(np.uint8)
    g[...,3]=255
    im=Image.fromarray(g,'RGBA')
    # logo centrado, alto = 66% del panel
    lh=max(int(h*0.60),6); lw=max(int(lh*logo.width/logo.height),6)
    l=logo.resize((lw,lh), Image.LANCZOS)
    im.paste(l,((w-lw)//2,(h-lh)//2),l)
    # bordes difuminados: que no se vea el recorte pegado
    m=Image.new('L',(w,h),0)
    d=ImageDraw.Draw(m); b=max(2,int(min(w,h)*0.06))
    d.rectangle([b,b,w-b,h-b],fill=255)
    m=m.filter(ImageFilter.GaussianBlur(max(1.2,b*0.55)))
    im.putalpha(m)
    return im

cap=cv2.VideoCapture('public/backlot/hero-loop.mp4')
import os
os.makedirs('/tmp/track/png',exist_ok=True)
i=0
while True:
    ok,fr=cap.read()
    if not ok: break
    w,h=WW[i]*1.05, HH[i]*1.38          # cubre de sobra: el borde va difuminado y no se nota
    x,y=CX[i]-w/2, CY[i]-h/2 + h*0.02   # un pelin abajo: por ahi asomaba el cartel viejo
    base=Image.fromarray(cv2.cvtColor(fr,cv2.COLOR_BGR2RGB)).convert('RGBA')
    p=panel(w,h)
    base.alpha_composite(p,(int(round(x)),int(round(y))))
    base.convert('RGB').save(f'/tmp/track/png/{i:05d}.png')
    i+=1
cap.release()
print("frames compuestos:",i)
