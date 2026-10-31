/** Printable versions of the two in-feed promotions. Same source copy. */
import { PDFDocument, StandardFonts, rgb, PDFName, PDFString } from 'pdf-lib'
import QRCode from 'qrcode'
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
import { tsImport } from 'tsx/esm/api'
const {PROMOTIONS}=await tsImport('../src/data/promotions.ts',import.meta.url)
const clean=s=>s.replace(/[‘’]/g,"'").replace(/[–—]/g,'-').replace(/·/g,' / ')
const colour=hex=>rgb(...hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255))
mkdirSync('output/pdf',{recursive:true});mkdirSync('public/promos',{recursive:true})
for(const promo of PROMOTIONS){
 const doc=await PDFDocument.create(),page=doc.addPage([612,792])
 doc.setTitle(promo.eyebrow);doc.setAuthor('BEASTY Pages');doc.setSubject(promo.note)
 const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold),ink=rgb(.09,.09,.09)
 const text=(s,x,y,size=12,font=regular)=>page.drawText(clean(s),{x,y,size,font,color:ink})
 const wrap=(s,x,y,size,width,leading)=>{
  let line=''
  for(const word of clean(s).split(/\s+/)){
   if(regular.widthOfTextAtSize((line?line+' ':'')+word,size)>width&&line){text(line,x,y,size);y-=leading;line=word}else line+=(line?' ':'')+word
  }
  if(line)text(line,x,y,size)
  return y-leading
 }
 page.drawRectangle({x:0,y:0,width:612,height:792,color:colour(promo.accent)})
 page.drawSvgPath('M0 0L0 28L28 28Z',{x:536,y:746,color:ink})
 text(clean(promo.eyebrow),48,738,10,bold)
 text('BEASTY PROMOTION',48,704,9)
 promo.title.forEach((line,i)=>text(line,46,633-i*54,44,bold))
 text(promo.price,46,477,promo.id==='website-pilot'?84:34,bold)
 wrap(promo.sub,48,445,14,500,20)
 promo.points.forEach((line,i)=>{text('0'+(i+1),48,384-i*32,10,bold);text(line,76,382-i*32,14)})
 wrap(promo.note,48,264,11,500,16)
 page.drawLine({start:{x:48,y:192},end:{x:564,y:192},thickness:1,color:ink})
 page.drawRectangle({x:48,y:126,width:370,height:46,color:ink})
 page.drawText(promo.action,{x:66,y:143,size:15,font:bold,color:rgb(1,1,1)})
 const link=doc.context.obj({Type:'Annot',Subtype:'Link',Rect:[48,126,418,172],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(promo.href)}})
 page.node.set(PDFName.of('Annots'),doc.context.obj([doc.context.register(link)]))
 const qr=await doc.embedPng(await QRCode.toBuffer(promo.href,{width:300,margin:1,color:{dark:'#171717',light:promo.accent}}));page.drawImage(qr,{x:466,y:112,width:98,height:98})
 text(promo.href.replace('https://',''),48,98,10)
 text('BEASTYPAGES.COM',48,48,10,bold);text('31 OCT 2026',486,48,9)
 const path='output/pdf/'+promo.id+'.pdf';writeFileSync(path,await doc.save());copyFileSync(path,'public/promos/'+promo.id+'.pdf');console.log(path)
}
