const CACHE_NAME = "lead-tracker-pwa-v1";


const APP_FILES = [

    "./",

    "./index.html",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];



/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(function(cache) {

                    return cache.addAll(
                        APP_FILES
                    );

                })

        );


        self.skipWaiting();

    }
);



/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches
                .keys()
                .then(function(cacheNames) {

                    return Promise.all(

                        cacheNames
                            .filter(function(cacheName) {

                                return (
                                    cacheName !==
                                    CACHE_NAME
                                );

                            })

                            .map(function(cacheName) {

                                return caches.delete(
                                    cacheName
                                );

                            })

                    );

                })

        );


        self.clients.claim();

    }
);



/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    function(event) {

        /*
           Firebase requests ko cache nahi karenge.
           Firebase ko network se data lena hai.
        */

        if(
            event.request.url.includes(
                "googleapis.com"
            )
            ||

            event.request.url.includes(
                "firebase"
            )
        ) {

            return;

        }



        event.respondWith(

            fetch(event.request)

                .then(function(response) {

                    /*
                       Successful response ko cache
                       mein update karenge.
                    */

                    if(
                        response &&
                        response.status === 200 &&
                        response.type === "basic"
                    ) {

                        const responseClone =
                            response.clone();


                        caches
                            .open(CACHE_NAME)
                            .then(function(cache) {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });

                    }


                    return response;

                })

                .catch(function() {

                    /*
                       Internet nahi hone par
                       cached version use hoga.
                    */

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);
