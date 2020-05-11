//Model JS for the keeping trace of individual Responses

const mongoose = require('mongoose');

var responseSchema = new mongoose.Schema({
  tweetId : String,
  tweetText : String,
  maturity : String,
  askedByFriend : String,
  askedByStranger : String
});
console.log("ResponseModel.js called");
var responseModel = mongoose.model("Response",responseSchema);
module.exports = responseModel;
