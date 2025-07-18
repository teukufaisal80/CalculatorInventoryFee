
                // Service Worker for Collection Inventory Fee Calculator
                const CACHE_NAME = 'collection-inventory-fee-calculator-v1';
                const urlsToCache = [
                    '/',
                    '/index.html',
                    'https://cdn.tailwindcss.com',
                    'https://unpkg.com/xlsx/dist/xlsx.full.min.js'
                ];
                
                self.addEventListener('install', event => {
                    event.waitUntil(
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                return cache.addAll(urlsToCache);
                            })
                    );
                });
                
                self.addEventListener('fetch', event => {
                    event.respondWith(
                        caches.match(event.request)
                            .then(response => {
                                if (response) {
                                    return response;
                                }
                                return fetch(event.request);
                            })
                    );
                });
            