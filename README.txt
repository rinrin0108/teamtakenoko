$ mongod
$ node server.js

// You can get trip list by this request.
http://127.0.0.1:3000/getStressDatas

// You can get stress data by this request.
http://127.0.0.1:3000/getStressData/[tripId]
ex)http://127.0.0.1:3000/getStressData/3151221161600

// You can get Mapple recomend by this request.
http://127.0.0.1:3000/getMapple/[lat]/[lng]
ex)http://127.0.0.1:3000/getMapple/139.79841667/35.71505556
