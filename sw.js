var CACHE = 'comptes-v4';
var FICHIERS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(FICHIERS); })
      .then(function(){ return self.skipWaiting(); })
      .catch(function(){})
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(noms){
      return Promise.all(noms.map(function(n){ if(n !== CACHE) return caches.delete(n); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(rep){
      if(rep) return rep;
      return fetch(e.request).then(function(res){
        var copie = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copie); });
        return res;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
