var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var concertSchema = new Schema({
  cid: {required:true,type:Number},
   band:{required:true,type:String},
  about : {required:true,type:String},
  date : {required:true,type:String},
  cost:  {required:true,type:Number},
  place :{required:true,type:String},
  image: {required:true,type:String},
  passno : {required:true,type:Number},
  passesRemaining: {required:true,type:Number},
  discount :{required:true,type:String},
})
module.exports=mongoose.model('Concert', concertSchema);

