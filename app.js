//The entry point for the MCQ-WebApp
//author : aditya.shahi
//version : 1.0.0
const expressModule = require('express');//The entrire express is exported
var fileDataLoader = require('./resourceFileLoader');
var bodyParser = require('body-parser');
const connection  = require('./connection');
const TweetModel = require('./dbModels/tweetModel');
const ResponseModel = require('./dbModels/responseModel');
var util = require('util');

connection();
//fileDataLoader();

var application = expressModule();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

application.set('view engine','ejs');
application.use('/assets',expressModule.static('assets'));//To serve all request to static (css,img) files
application.get('/home',function(req,res){
  res.render('home');
});
application.get('/questions',function(req,res){
  res.render('home');
});
var maturityLevelData = undefined;
const limit =10;
const size = 16600;
application.post('/home',urlencodedParser,function(req,res){
  try{
      maturityLevelData = req.body;
      if(maturityLevelData == undefined){
        return res.render('home');
      }
     var  random = Math.floor(Math.random() * size);
      const datas = TweetModel.collection.find({"responseLimitReached": 'No'}).skip(random).limit(limit).toArray().then((data) => {
      res.render('questions',{'ques' : data,'level': maturityLevelData});
});
  }catch(err){
    console.log("Following exception occurred :: "+err);
  }
});

application.post('/questions',urlencodedParser,function(req,res){
  try{
      updateDataToTweetDB(req.body);
      insertDataToResponseDB(req.body);
      if(maturityLevelData == undefined){
        return res.render('home');
      }
      var  random = Math.floor(Math.random() * size);
      var nextData = TweetModel.collection.find({"responseLimitReached": 'No'}).skip(random).limit(limit).toArray().then((data) => {
      res.render('questions',{'ques' : data,'level': maturityLevelData});
    // return res.json(util.inspect(req.body));
    });
  }catch(err){
    console.log("Following exception occurred :: "+err);
  }
});

function updateDataToTweetDB(response){
  try{
    Object.keys(response).forEach(function(key) { //Objects method will return the json as array
          console.log(Object.keys(response));
          var valueVar = response[key];
          //corresponding check added to make sure both parts of a question is answered
          if(!key.includes("Friend")){
             if(!Object.keys(response).includes(key+"Friend")){
               console.log("Corresponding entry1 missing"+key);
                 return;
             }
          }
          if(key.includes("Friend")){
            key = key.substring(0, key.indexOf("Friend"));
            if(!Object.keys(response).includes(key)){
              console.log("Corresponding entry2 missing"+key);
                return;
            }
          }
          console.log(Object.keys(response));
          var tweetToBeUpdated ={'tweetId':key};
          console.log("Updating Key ::"+key);
          var record = TweetModel.collection.find(tweetToBeUpdated).toArray().then((data) => {
            if(data.length == 1){
              console.log(data[0][valueVar]+5);
              var json = {};
              json[valueVar] = data[0][valueVar]+1;
              json['TotalAnswered'] = data[0]['TotalAnswered']+2;
              console.log("Limit Current"+data[0]['TotalAnswered']);
              if( data[0]['TotalAnswered'] >= 2){
                  json['responseLimitReached'] = 'Yes';
              }
              var tweetUpdateParameters = { $set: json};
              TweetModel.collection.updateOne(tweetToBeUpdated,tweetUpdateParameters).then((data) => {
        });
            }
        });

   })
 }catch(err){
   console.log("Following exception occurred while updating :: "+err);
 }
}



function insertDataToResponseDB(response){
  try{
    var tweetResponseArray = [];
    var keyArray =  Object.keys(response);//Objects method will return the json as array
    var ret =  keyArray.forEach(function(key) {
          console.log(Object.keys(response));
          var valueVar = response[key];
          var responseByFriend = undefined;
          var responseByStranger = undefined;
          //corresponding check added to make sure both parts of a question is answered
          if(!key.includes("Friend")){
             if(!Object.keys(response).includes(key+"Friend")){
               console.log("Corresponding entry1 missing"+key);
                 return;
             }else{
               console.log("Corresponding entry1 is present"+key);
               responseByStranger = response[key];
               responseByFriend = response[key+"Friend"];
               var index = Object.keys(response).indexOf(key+"Friend");
                if (index > -1) {
                    keyArray.splice(index, 1);
                }
               console.log("Here1 By Stranger :"+responseByStranger+"By Friend"+responseByFriend);
             }
          }
          if(key.includes("Friend")){
            responseByFriend = response[key];
            key = key.substring(0, key.indexOf("Friend"));
            if(!Object.keys(response).includes(key)){
              console.log("Corresponding entry2 missing"+key);
                return;
            }else{
              console.log("Corresponding entry2 is present"+key);
              responseByStranger = response[key];
              var index = Object.keys(response).indexOf(key);
              if (index > -1) {
                   keyArray.splice(index, 1);
               }
              console.log("Here1 By Stranger :"+responseByStranger+"By Friend"+responseByFriend);
            }
          }
          console.log(Object.keys(response));
          var getTweetFromDB ={'tweetId':key};
          console.log("Updating Key ::"+key);
          var record = TweetModel.collection.find(getTweetFromDB).toArray().then((data) => {
            if(data.length == 1 && maturityLevelData != undefined && responseByFriend != undefined && responseByStranger != undefined ){
              var newResponse = {
                tweetId : data[0].tweetId,
                tweetText : data[0].tweetText, // The tweet to be displayed in Question
                maturity : maturityLevelData,
                askedByFriend : responseByFriend,
                askedByStranger : responseByStranger
              };
              tweetResponseArray.push(newResponse);
              console.log("Uploading data to Response Schema>>>>>>>>>>>");
              ResponseModel.collection.insertOne(newResponse,function(err){
                if(err){
                  console.log("Exception occurred while saving the data"+err);
                }else{
                  console.log("Successfully saved data to Resonse Model Schema...");
                }
              });
            }
        });
   })
 }catch(err){
   console.log("Following exception occurred while updating :: "+err);
 }
}

application.listen(4000);
