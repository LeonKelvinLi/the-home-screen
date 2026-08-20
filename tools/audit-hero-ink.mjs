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
const OUT=process.argv[2]
for (const id of ['b_rywire','b_downtownbbq','b_sincitypits']) {
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
  }
  await p.close()
}
await b.close(); srv.kill()
console.log('captured')
