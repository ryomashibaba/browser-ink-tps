#!/usr/bin/env python3
"""B265 offline ORIGINAL WebGL2 WallMetal00 A/B/A attribution, diagnostic only.
Usage: python scripts/qa-offline/t21-b265-metal-raster-compare.py evidence.zip output_dir
Uses Pillow. Never confuses source optical display with certified painted pixels.
"""
import json,zipfile,hashlib,statistics,sys
from pathlib import Path
from io import BytesIO
from PIL import Image,ImageChops,ImageDraw

SOURCE='25/17/26/0'
TARGET='Fld_Temple01_WallMetal00'
SIZE=(1600,900)

def require(ok,tag):
 if not ok:raise ValueError('B265_'+tag)

def member(z,name):
 hits=[x for x in z.namelist() if x==name or x.endswith('/'+name)]
 require(len(hits)==1,'UNIQUE_EVIDENCE_'+name)
 return z.read(hits[0])

def frame(z,meta):
 binary=member(z,meta['name']+'.png')
 require(len(binary)==meta['bytes'] and
  hashlib.sha256(binary).hexdigest()==meta['sha256'],'SCREENSHOT_INTEGRITY')
 im=Image.open(BytesIO(binary))
 require(im.format=='PNG' and im.size==SIZE,'NATIVE_1600_900_IMAGE')
 return im.convert('RGB')

def median_rgb(img,x,y):
 xx,yy=int(round(x)),int(round(y))
 px=img.load()
 vals=[px[i,j] for j in range(max(0,yy-2),min(900,yy+3))
       for i in range(max(0,xx-2),min(1600,xx+3))]
 return [int(statistics.median(k[c] for k in vals)) for c in range(3)]

def run(archive,output):
 out=Path(output);out.mkdir(parents=True,exist_ok=True)
 report={}
 with zipfile.ZipFile(archive) as z:
  for label in ('FROZEN','REAL_INK'):
   d=json.loads(member(z,'b265-'+label.lower()+'-original-source-metal-aba.json'))
   material=d['metalMaterial'];owner=d['nativeOwnerGridProjection']
   require(d['schema']=='B265_GENUINE_PINNED_METAL_SOURCE_ABA'
    and d['source']==SOURCE and d['sourceUvTriangles']==57578
    and d['label']==label,'PROVENANCE')
   require(material['hiddenMaterial']==TARGET
    and material['materialKind']=='METAL'
    and material['exactSourceMaterialIdentityVerified']
    and material['originalUvTriangles']==57578,'PINNED_METAL_IDENTITY')
   for k in ('materialBytesChanged','originalTrianglesModified','stageSolidsModified',
             'paintableSurfacesModified','navLinksModified','scoreableSurfacesModified',
             'actorTransformsModified'):
    require(material[k]==0,'MUTATION_'+k)
   require(owner['source']==SOURCE and owner['sourcePaintSurfaces']==17
    and owner['sourceUvTriangles']==57578
    and owner['ownedCells']==owner['ownedA']+owner['ownedB']
    and owner['sampledCells']==len(owner['samples'])
    and not d['artAccepted'] and not d['productionAuthorized'],'OWNER_SOURCE')
   a,b,a2=[frame(z,d[k]) for k in ('A','B','A2')]
   restored=ImageChops.difference(a,a2)
   max_restore=max(pair[1] for pair in restored.getextrema())
   restore_count=sum(max(v)>0 for v in restored.getdata())
   require(max_restore<=1 and restore_count<=576
    and d['pixels']['appearanceRestored'],'RESTORATION')
   delta=ImageChops.difference(a,b)
   changed=sum(max(v)>0 for v in delta.getdata())
   points=[]
   for x in owner['samples']:
    if not x['insideViewport']:continue
    px,py,depth=x['screenPx']
    require(0<=px<1600 and 0<=py<900 and depth>0,'INVALID_PROJECTION')
    c1=median_rgb(a,px,py);c2=median_rgb(b,px,py)
    strength=max(abs(q-r) for q,r in zip(c1,c2))
    points.append(dict(surfaceId=x['surfaceId'],screenPx=[px,py],
     baselineRGB=c1,metalHiddenRGB=c2,maximumRGBDelta=strength))
   require(len(points)==owner['samplesInsideViewport'],'ONSCREEN_COUNT')
   if label=='REAL_INK':require(owner['ownedCells']>0 and len(points)>0,'NO_REAL_INK')
   summary=dict(context=label,source=SOURCE,originalTriangles=57578,
    ownedCells=owner['ownedCells'],onscreenSamples=len(points),
    fullFrameChangedPixels=changed,fullFrameChangedRatio=changed/1440000,
    samplesAtLeast8=sum(v['maximumRGBDelta']>=8 for v in points),
    samplesAtLeast24=sum(v['maximumRGBDelta']>=24 for v in points),
    medianSampleMaxChannelDelta=statistics.median(
     (v['maximumRGBDelta'] for v in points)) if points else None,
    restoredChangedPixels=restore_count,diagnosticOnly=True,
    measuredColoredInkPixelCount=False,artAccepted=False,
    originalSourceMeshRemovalAuthorized=False,productionAuthorized=False)
   report[label]=dict(summary=summary,samples=points)
   print(json.dumps(summary,ensure_ascii=False))
   if label=='REAL_INK':
    sheet=Image.new('RGB',(1600,650),'#101924');draw=ImageDraw.Draw(sheet)
    for i,(img,title) in enumerate(((a,'A original metal'),(b,'B metal hidden temporarily'))):
     x0=20+i*800
     sheet.paste(img.crop((695,395,900,520)).resize((760,460)),(x0,60))
     draw.text((x0,24),title,fill='white')
     for p in points:
      x,y=p['screenPx']
      xx=x0+(x-695)*760/205;yy=60+(y-395)*460/125
      draw.ellipse((xx-4,yy-4,xx+4,yy+4),outline='#ffe26b',width=2)
    draw.text((20,548),f"{len(points)} native owned-cell projections, not certified colored pixels",fill='white')
    draw.text((20,577),"Only WallMetal00 optical draw visibility toggled under paused SOURCE QA",fill='white')
    sheet.save(out/'B265_native_metal_AB_ink_crop.png')
 (out/'B265_native_metal_offline.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 return report

if __name__=='__main__':
 require(len(sys.argv)==3,'ARGUMENTS_ZIP_OUTPUT_DIRECTORY')
 run(sys.argv[1],sys.argv[2])
