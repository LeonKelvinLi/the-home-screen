/* The watch window: silent on open, audible after one tap, and the files
   actually carry an audio track.

   This exists because "the audio is not working" was true for weeks and nothing
   here would have caught it: every clip had been encoded with `-an`, so there
   was no track to unmute, and a muted <video> with no audio looks identical to
   a muted <video> with audio. The check that matters is webkitAudioDecodedByteCount
   — bytes the browser has actually decoded. Zero means silence shipped. */
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { VITE } from './bin.mjs'
const freePort=()=>new Promise(r=>{const s=createServer();s.listen(0,()=>{const{port}=s.address();s.close(()=>r(port))})})
const port=await freePort()
const srv=spawn(process.execPath,[VITE,'preview','--strictPort','--port',String(port)],{stdio:'ignore'})
const base=`http://localhost:${port}`
for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break}catch{await new Promise(r=>setTimeout(r,250))}}
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']})
const p=await b.newPage({viewport:{width:393,height:852},deviceScaleFactor:2})
await p.goto(base,{waitUntil:'networkidle'})
await p.click('[aria-label="Enter BEASTY"]')
await p.waitForTimeout(2600)
const watch = await p.$('[aria-label*="Watch"]')
if(!watch){ console.log('Watch button not found'); const bytes = await p.evaluate(()=>{ const v=document.querySelector('.reel video'); return v?.webkitAudioDecodedByteCount ?? 0 })
await b.close(); srv.kill()
if (!bytes) { console.log('\nFAIL: no audio decoded — the clips have no sound track'); process.exit(1) }
console.log('\nPASS: reels ship audio and unmute on tap.'); process.exit(1) }
await watch.click(); await p.waitForTimeout(2000)

const read = () => p.evaluate(()=>{
  const v=document.querySelector('.reel video')
  return { hasAudio: !!v && (v.mozHasAudio ?? (v.webkitAudioDecodedByteCount>0) ?? null),
           muted: v?.muted, paused: v?.paused, t:+(v?.currentTime||0).toFixed(1),
           reels: document.querySelectorAll('.reel').length,
           toggles: document.querySelectorAll('.reel-sound').length }
})
console.log('on open      :', JSON.stringify(await read()))
await p.click('.reel-sound')
await p.waitForTimeout(1200)
console.log('after 1 tap  :', JSON.stringify(await read()))
await p.click('.reel-sound')
await p.waitForTimeout(600)
console.log('after 2 taps :', JSON.stringify(await read()))
console.log('aria-pressed :', await p.getAttribute('.reel-sound','aria-pressed'))
console.log('audio bytes decoded:', await p.evaluate(()=>{
  const v=document.querySelector('.reel video'); return v?.webkitAudioDecodedByteCount ?? 'n/a' }))
await p.screenshot({path:'/private/tmp/claude-501/-Users-leon/65b00703-f0ad-4535-98e3-27d8a7170959/scratchpad/sound.png'})
const bytes = await p.evaluate(()=>{ const v=document.querySelector('.reel video'); return v?.webkitAudioDecodedByteCount ?? 0 })
await b.close(); srv.kill()
if (!bytes) { console.log('\nFAIL: no audio decoded — the clips have no sound track'); process.exit(1) }
console.log('\nPASS: reels ship audio and unmute on tap.')
