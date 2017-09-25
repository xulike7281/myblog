// Post model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: {type :String,required:true},
  content: {type :String,required:true},
  slug: {type :String},
  category: {type :Schema.Types.ObjectId,ref:"Category"},
  author: {type :Schema.Types.ObjectId,ref:"User"},
  published: {type :Boolean,default:false},
  mate: {type :Schema.Types.Mixed},
  comments: [Schema.Types.Mixed],
  created: {type:Date}

});

mongoose.model('Post', PostSchema);

