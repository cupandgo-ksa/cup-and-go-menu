const IMAGE_CACHE='cng-menu-images-v1';

self.addEventListener('install',event=>{
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('cng-menu-images-')&&k!==IMAGE_CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||req.destination!=='image')return;

  event.respondWith((async()=>{
    const cache=await caches.open(IMAGE_CACHE);
    const cached=await cache.match(req,{ignoreVary:true});
    const network=fetch(req).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){
        cache.put(req,res.clone()).catch(()=>{});
      }
      return res;
    }).catch(()=>cached);

    return cached||network;
  })());
});