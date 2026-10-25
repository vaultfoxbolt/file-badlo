// File Badlo service worker — bump C on every release
const C='fb-v13',LZ='fb-lazy';// LZ keeps the big OCR files across releases
const FILES=['./','index.html','manifest.json','icon.svg','jspdf.umd.min.js','pdf.min.js','pdf.worker.min.js','docx.umd.js','mammoth.browser.min.js','xlsx.full.min.js','quill.min.js','quill.snow.css','pdf-lib.min.js','marked.min.js','html2canvas.min.js','tesseract.min.js'];
// Large OCR files (worker, wasm core, traineddata) are cached on first use
const LAZY=['tesseract-worker.min.js','tesseract-core-simd-lstm.wasm.js','tesseract-core-lstm.wasm.js','eng.traineddata.gz','hin.traineddata.gz'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))))});
// On upgrade: delete old caches, take control, and reload open tabs (old pages had no reload logic)
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(async k=>{const old=k.filter(x=>x!==C&&x!==LZ);await Promise.all(old.map(x=>caches.delete(x)));await self.clients.claim();
  if(old.length)setTimeout(()=>self.clients.matchAll({type:'window'}).then(cs=>cs.forEach(c=>c.navigate(c.url).catch(()=>{}))),0)})));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  const html=e.request.mode==='navigate'||u.pathname.endsWith('.html')||u.pathname.endsWith('/')||u.pathname.endsWith('sw.js');
  if(html)e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
  else e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok&&LAZY.some(f=>u.pathname.endsWith(f))){const c=n.clone();caches.open(LZ).then(x=>x.put(e.request,c))}return n})))});
