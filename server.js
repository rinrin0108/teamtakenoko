app = require('express')();

var mongoose = require('mongoose');
var parser = require('xml2json');

var stressSchema = mongoose.Schema({
  tripId: Number,
  time: String,
  loc: {
    lat: Number,
    lng: Number
  },
  stress: Number
});
stressSchema.index({ loc: '2d' });
var Stress = mongoose.model('Stress', stressSchema);

var Client = require('node-rest-client').Client;
var clientForCar = new Client();
clientForCar.registerMethod("restrequest", "http://trial.spatiowl.jp.fujitsu.com:8080/SPATIOWLTrial231/webapi/restrequest", "GET");
var clientForOwn = new Client();
clientForOwn.registerMethod("restrequest", "http://localhost:3000/${path}", "GET");
var clientForMapple = new Client();
clientForMapple.registerMethod("restrequest", "http://ws.chizumaru.com/devkit/guide/service.asmx/GetFromCircle", "GET");

// connect to mongodb
mongoose.connect('mongodb://localhost/teamtakenoko');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to mongodb by mongoose!");
  console.log("server running at http://127.0.0.1:3000/");
});


app.get('/', function(req, res){
  res.send("hello takenoko");
});

app.get('/getAllLogs', function(req, res, next){
  Stress.find({}, function(err, docs){
    var list = [];
    docs.forEach(function(m){
      list.push(m);
    });
    res.send(list);
  });
});

app.get('/getTripLogList', function(req, res, next){
  var args = {
    parameters: {
      method: 'getTripLogList',
      id: '00000003'
    }
  };
  clientForCar.methods.restrequest(args, function (data, response) {
    res.send(data);
  });
});

app.get('/getDriveData/:tripId', function(req, res, next){
  var args = {
    parameters: {
      method: 'getDriveData',
      id: '00000003',
      tripId: req.params.tripId
    }
  };
  clientForCar.methods.restrequest(args, function (data, response) {
    res.send(data);
  });
});

app.get('/getTripLog/:tripId', function(req, res, next){
  var args = {
    parameters: {
      method: 'getTripLog',
      id: '00000003',
      tripId: req.params.tripId
    }
  };
  clientForCar.methods.restrequest(args, function (data, response) {
    res.send(data);
  });
});


app.get('/saveStressData/:tripId', function(req, res, next){
  Stress.remove({tripId: req.params.tripId}, function(){
  });
  var args = {
    parameters: {
      method: 'getDriveData',
      id: '00000003',
      tripId: req.params.tripId
    }
  };
  clientForCar.methods.restrequest(args, function (data, response) {
    for (var i = 0; i < data.resultData.driveData.length; i ++) {
      var rowData = data.resultData.driveData[i];
      var newRecord = new Stress();
      newRecord.tripId = req.params.tripId;
      newRecord.time = rowData.TLM_DataGetTime;
      newRecord.loc.lng = rowData.TLM_VehicleLongitude;
      newRecord.loc.lat = rowData.TLM_VehicleLatitude;
      // ストレス値を計算して格納
      var K1 = 20 / (parseFloat(rowData.TLM_OptionalAttribute2) + parseFloat(rowData.TLM_OptionalAttribute1));
      var K2 = (0.2 * parseFloat(rowData.TLM_VehicleSpeed)*100) / parseFloat(rowData.TLM_OptionalAttribute3);

      newRecord.stress = K1 + K2;
      if(newRecord.stress > 50){
        console.log("Inserting new record:" + newRecord);
      }
      newRecord.save(function(err){
      });
    };
  });
  res.send({result: true});
});

/* // バックエンドのサーバ落ちちゃうので使っちゃダメ
app.get('/makeData', function(req, res, next){
console.log("test");
Stress.remove({}, function(){
});
var args = {
path: { "path": "getTripLogList/" }
};
clientForOwn.methods.restrequest(args, function (data, response) {
console.log(data);
for (var i = 0; i < data.resultData.tripIdList.length; i ++) {
console.log(data.resultData.tripIdList[i].tripId);
var args = {
path: { "path": "saveStressData/" + data.resultData.tripIdList[i].tripId }
};
clientForOwn.methods.restrequest(args, function (data, response) {
});
};
});
res.send({result:true});
});
*/

app.get('/getStressDatas', function(req, res, next){
  Stress.find({}).distinct("tripId", function(err, docs){
    var list = [];
    docs.forEach(function(m){
      list.push(m);
    });
    res.send(list);
  });
});

app.get('/getStressData/:tripId', function(req, res, next){
  Stress.find({ tripId:req.params.tripId }, { "_id": false, "tripId": false }).sort("time").exec(function(err, docs){
    var list = [];
    docs.forEach(function(m){
      list.push(m);
    });
    res.send(list);
  });
});

app.get('/getMapple/:lat/:lng', function(req, res, next){
  // 世界測地系→日本測地系
  var lat, lng;
  var la = parseFloat(req.params.lat);
  var ln = parseFloat(req.params.lng);
  lat = la + la * 0.00010696 - ln * 0.000017467 - 0.0046020;
  lng = ln + la * 0.000046047 + ln * 0.000083049 - 0.010041;

  var args = {
    parameters: {
      app: 'kddisou',
      x: Math.round(lat*3600),
      y: Math.round(lng*3600),
      distance: '1000',
      keyword: '',
      genreID: '',
      addressCode: '',
      orderby: '',
      offset: '',
      limit: '1000',
      option: ''
    },
    headers: {
      Host: 'ws.chizumaru.com',
      Connection: 'keep-alive',
      'Cache-Control': 'max-age=0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, sdch',
      'Accept-Language': 'ja,en-US;q=0.8,en;q=0.6'
    }
  };

  clientForMapple.methods.restrequest(args, function (data, response) {
    var json = JSON.parse(parser.toJson(data));
    var resJson = [];
    for (var i = 0; i < json.GuideInfo.elements.GuideElement.length; i ++) {
      var element = {};
      element.POI_NAME = json.GuideInfo.elements.GuideElement[i].POI_NAME;
      element.COPY = json.GuideInfo.elements.GuideElement[i].COPY;
      element.KIJI = json.GuideInfo.elements.GuideElement[i].KIJI;
      resJson.push(element);
    };
    res.send(resJson);
  });

});



app.listen(3000);
