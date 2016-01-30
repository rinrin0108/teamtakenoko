app = require('express')();

var mongoose = require('mongoose');

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
      newRecord.stress = 100;
      console.log("Inserting new record");
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


app.listen(3000);
