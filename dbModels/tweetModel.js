//Model JS for the tweet that is to be loaded

const mongoose = require('mongoose');

var tweetSchema = new mongoose.Schema({
  tweetId : String,
  tweetText : String, // The tweet to be displayed in Question
  Insult : Number,
  Humour : Number ,
  Neutral : Number,
  TotalAnswered : Number,  // value of number of Yes+No+Neutral Answers
  responseLimitReached : String
});
console.log("TweetModel.js called");
var tweetModel = mongoose.model("Tweet",tweetSchema);
module.exports = tweetModel;
