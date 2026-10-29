const C='minuteur-v3';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  // La vidéo anti-veille passe hors cache : Safari lit les vidéos par morceaux (Range)
  if(req.headers.has('range')||req.url.endsWith('.mp4'))return;
  const keep=res=>{if(res.ok&&(new URL(req.url).origin===location.origin||req.url.includes('fonts.g'))){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}return res};
  // Page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(keep).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));return}
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(keep)));
});
