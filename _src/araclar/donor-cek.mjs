// Salt GET donör çekimi: render edilmiş DOM + varlıklar. Form gönderme yok.
import { createRequire } from 'node:module';
import fs from 'node:fs'; import path from 'node:path';
const require = createRequire(process.env.PW_KOK ?? process.cwd() + '/package.json');
const { chromium } = require('playwright');
const UA='DadaGourmetKanonBot/1.0';
const OUT=process.argv[2]; const list=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const b=await chromium.launch();
const ctx=await b.newContext({userAgent:UA,viewport:{width:1440,height:900},locale:'tr-TR'});
await ctx.route('**/*',r=>{ const q=r.request(); if(q.method()!=='GET'){return r.abort();} return r.continue();});
const seen={};
for(const [ad,url] of list){
  const p=await ctx.newPage();
  const res=[];
  p.on('response',async x=>{ try{ const u=new URL(x.url()); const t=x.request().resourceType(); if(!['stylesheet','script','font','image'].includes(t))return; res.push([t,x.status(),x.url()]);
    if(['stylesheet','script','font'].includes(t) && x.status()===200){ const f=path.join(OUT,'assets',u.hostname,u.pathname); if(!fs.existsSync(f)){ fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f,await x.body()); } } }catch(e){} });
  let st=0; try{ const r=await p.goto(url,{waitUntil:'load',timeout:45000}); st=r?.status(); }catch(e){ console.log('HATA',ad,e.message.slice(0,80)); }
  await p.waitForTimeout(1500);
  const html=await p.evaluate(()=>'<!doctype html>\n'+document.documentElement.outerHTML);
  fs.mkdirSync(path.join(OUT,'dom'),{recursive:true});
  fs.writeFileSync(path.join(OUT,'dom',ad+'.html'),html);
  fs.writeFileSync(path.join(OUT,'dom',ad+'.res.json'),JSON.stringify(res));
  console.log(ad,st,html.length,res.length);
  await p.close();
}
await b.close();
