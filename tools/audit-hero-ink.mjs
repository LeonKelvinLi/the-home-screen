/* Screenshots the hero tagline across many frames of the loop; the pixels are
   measured in Python, which already has PIL. pngjs is not a dependency here and
   adding one to run a check would be the wrong trade. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const srv=spawn('npx',['vite','preview','--strictPort','--port',String(port)],{stdio:'ignore'})
const base=`http://localhost:${port}`
for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch()
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
const OUT=process.argv[2] || mkdtempSync(join(tmpdir(),'heroink-'))
const shot=[]
for (const id of ['b_rywire','b_downtownbbq','b_sincitypits','b_luckythreeseven']) {
  const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2})
  await p.goto(`${base}/?b=${id}`,{waitUntil:'networkidle'})
  await p.waitForTimeout(1200)
  /*
    page.screenshot with a clip, not element.screenshot: the tagline sits over a
    PLAYING video, so Playwright's stability wait never settles and every
    capture timed out. animations:'allow' for the same reason — the whole point
    is to catch the loop mid-frame.
  */
  /*
    Whichever hero line actually has text. A roster seed's `tagline` is '' —
    seed() defaults it — so .brand-tagline renders at zero height for Rywire and
    the clip failed with "height to be greater than 0". The visible line over
    the film there is .brand-meta, which carries the cuisine.
  */
  const box=await p.evaluate(()=>{
    for (const sel of ['.brand-tagline','.brand-meta']) {
      const e=document.querySelector(sel)
      if(!e) continue
      const r=e.getBoundingClientRect()
      if(r.height>4 && r.width>8 && (e.textContent||'').trim())
        return {x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)}
    }
    return null
  })
  if(!box||box.width<8){console.log(`${id}: no tagline`);await p.close();continue}
  for (let s=0;s<8;s++){
    await p.waitForTimeout(1150)
    await p.screenshot({path:`${OUT}/${id}-${s}.png`, clip:box, animations:'allow'})
    shot.push(`${id}-${s}.png`)
  }
  await p.close()
}
await b.close(); srv.kill()

/*
  IT NOW JUDGES WHAT IT CAPTURED. Until this, the tool took thirty-two
  screenshots and printed the word "captured" — the measuring was done by hand
  in a throwaway script that was never committed, so the check only worked while
  somebody remembered how. An audit nobody can re-run is a folder of PNGs.

  BRIGHTEST 0.3% AGAINST THE MEDIAN. The ink is white and the glyphs are a few
  percent of a wide box, so a percentile anywhere near the middle measures the
  video and not the text. An earlier attempt used the 92nd and reported a
  legible line at 1.99:1, then said DEEPENING the scrim made it worse — which is
  how the metric was caught rather than the design.
*/
const py = `
import sys, glob, os, warnings
warnings.filterwarnings('ignore')
from PIL import Image
def lin(v):
    v/=255.0
    return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
def lum(p): return 0.2126*lin(p[0])+0.7152*lin(p[1])+0.0722*lin(p[2])
worst={}
for f in sorted(glob.glob(os.path.join(sys.argv[1],'*.png'))):
    bid=os.path.basename(f).rsplit('-',1)[0]
    im=Image.open(f).convert('RGB')
    ls=sorted(lum(p) for p in im.getdata())
    if len(ls)<50: continue
    ink=sum(ls[-max(1,len(ls)//333):])/max(1,len(ls)//333)   # brightest 0.3% = the glyphs
    bg=ls[len(ls)//2]                                        # median = the video behind them
    r=(max(ink,bg)+0.05)/(min(ink,bg)+0.05)
    if bid not in worst or r<worst[bid]: worst[bid]=r
bad=0
for bid,r in sorted(worst.items()):
    ok = r>=4.5
    bad += 0 if ok else 1
    print(f'  {bid:22s} worst frame {r:5.2f}:1  {"PASS" if ok else "FAIL"}')
print(f'\\n{bad} brand(s) under 4.5:1 over their own film')
sys.exit(1 if bad else 0)
`
try {
  console.log(execFileSync('/opt/homebrew/bin/python3', ['-c', py, OUT], {encoding:'utf8'}))
} catch (e) {
  console.log(e.stdout || String(e))
  process.exit(1)
}
