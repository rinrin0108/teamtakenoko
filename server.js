app = require('express')();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/teamtakenoko');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

var stressSchema = mongoose.Schema({
    time: String,
    loc: {
        lat: Number,
        lng: Number
    },
    stress: Number
});
stressSchema.index({ loc: '2d' });
var Stress = mongoose.model('Stress', stressSchema);

var stress = new Stress({
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

app.listen(3000);
