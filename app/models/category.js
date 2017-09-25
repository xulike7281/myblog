// Category model

var mongoose = require('mongoose');
var  Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: {type :String,required:true},
  created: {type:Date}

});

mongoose.model('Category', CategorySchema);

