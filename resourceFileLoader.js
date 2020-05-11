//In this file , we'll be loading the tweets from the csv file to the Mongo DataBase

const FileStream = require('fs');
const TweetModel = require('./dbModels/tweetModel');

console.log("TweetLoader.js called");
var loader = function(){
  try{
    var tweetDataArray = [];
    console.log("Loading data to MLab Server from TweetData.csv...Please wait.")
    var data = FileStream.readFileSync('./resources/tweetData1.csv','utf8').split("\n");
    for(var count =0;count < data.length ; count++){
      var eachLine = data[count];
      var eachLineArray = eachLine.split(",");
      if(!isNaN(eachLineArray[0]) && eachLineArray[2] != undefined && eachLineArray[2].length > 10){
        var newTweet = {
          tweetId : eachLineArray[0],
          tweetText : eachLineArray[2], // The tweet to be displayed in Question
          Insult : 0,
          Humour : 0 ,
          Neutral : 0,
          TotalAnswered : 0,  // value of number of Yes+No+Neutral Answers
          responseLimitReached : 'No'
        };
        tweetDataArray.push(newTweet);
    }}
  TweetModel.collection.insertMany(tweetDataArray,function(err){
    if(err){
      console.log("Exception occurred while saving the data"+err);
    }else{
      console.log("Successfully Loaded all the data to MLab Server...");
    }
  });
  } catch(err){
    console.log("Following exception occurred :: "+err);
  }
};

module.exports = loader;
