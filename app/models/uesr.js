// User model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {type :String,required:true},
  email: {type :String,required:true},
  password: {type :String,required:true},
  created: {type:Date}

});
var hash = require("md5")

UserSchema.methods.verifyPassword = function (password) {
  var isMatch = hash(password) === this.password;
    console.log("UserSchema.methods.verifyPassword:",password,this.password,isMatch);
    return isMatch
}

mongoose.model('User', UserSchema);

