var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var chaptcha_v3 = true;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.get('/',function(req,res) {
  // Sending our HTML file to browser.
  if(chaptcha_v3) {
    res.sendFile(__dirname + '/index_v3.html');
  } else {
    res.sendFile(__dirname + '/index_v2.html');
  }
});

app.post('/submit',function(req,res){
  if(chaptcha_v3){
      // g-recaptcha-response is the key that browser will generate upon form submit.
      // if its blank or null means user has not selected the captcha, so return the error.
      if(req.body['g-recaptcha-response-v3'] === undefined || req.body['g-recaptcha-response-v3'] === '' || req.body['g-recaptcha-response-v3'] === null) {
        return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
      }
      // Put your secret key here.
      var secretKey = "6Lc70ZUUAAAAAJaqHNalR88MW0oq8_3mHTguDB3p";
      // req.connection.remoteAddress will provide IP address of connected user.
      var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response-v3'] + "&remoteip=" + req.connection.remoteAddress;
      // Hitting GET request to the URL, Google will respond with success or error scenario.
      request(verificationUrl,function(error,response,body) {
        body = JSON.parse(body);
        console.log(body);
        // Success will be true or false depending upon captcha validation.
        if(body.success !== undefined && !body.success) {
          return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
        }

        console.log("ReCaptcha score: " + body.score);

        if(body.score === 0.9) {
          console.log("Entra");
          chaptcha_v3 = false;
          // Reload code here
          res.sendFile(__dirname + '/index_v2.html');
        }
      });
  } else {
      // g-recaptcha-response is the key that browser will generate upon form submit.
      // if its blank or null means user has not selected the captcha, so return the error.
      if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
      }
      // Put your secret key here.
      var secretKey = "6LcZzpUUAAAAAHpYiTVaA_TexgTUaYXFncls8VcR";
      // req.connection.remoteAddress will provide IP address of connected user.
      var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
      // Hitting GET request to the URL, Google will respond with success or error scenario.
      request(verificationUrl,function(error,response,body) {
        body = JSON.parse(body);
        console.log(body);
        // Success will be true or false depending upon captcha validation.
        if(body.success !== undefined && !body.success) {
          return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
        }
        res.json({"responseCode" : 0,"responseDesc" : "Sucess"});
        chaptcha_v3 = true;
      });
  }
});

// This will handle 404 requests.
app.use("*",function(req,res) {
  res.status(404).send("404");
})

// lifting the app on port 3000.
app.listen(3000);