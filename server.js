app = require('express')();

var mongoose = require('mongoose');

var stressSchema = mongoose.Schema({
    uid: Number,
    time: String,
    loc: {
        lat: Number,
        lng: Number
    },
    stress: Number
});
stressSchema.index({ loc: '2d' });

var Client = require('node-rest-client').Client;
var client = new Client();
client.registerMethod("restrequest", "http://trial.spatiowl.jp.fujitsu.com:8080/SPATIOWLTrial231/webapi/restrequest", "GET");

// connect to mongodb
mongoose.connect('mongodb://localhost/teamtakenoko');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to mongodb by mongoose!");
  console.log("server running at http://127.0.0.1:3000/");
});

var Stress = mongoose.model('Stress', stressSchema);

var stress = new Stress({
    uid: 1,
    time: '20160130',
    loc: {
        lng: 139.6597057,
	lat: 35.56435159999999
    },
    stress: 80 
});

app.get('/', function(req, res){
    res.send(stress);
});

// get all logs
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
  client.methods.restrequest(args, function (data, response) {
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
  client.methods.restrequest(args, function (data, response) {
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
  client.methods.restrequest(args, function (data, response) {
	res.send(data);
  });
});




app.listen(3000);
