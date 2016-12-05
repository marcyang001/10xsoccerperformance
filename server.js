var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var https = require('https');
// [START setup]
var api_key = 'key-dd61880d10fe2238e4f11c024671f57e';
var domain = 'sandbox89d24255fa0e44ba8d22681c98ff8234.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

// [END setup]

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var app = express();

// [ Global functions region ]

function getClientAddress(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// [ End of Global Functions ]


// [ Requests Handlers Region ]
// load the index.html page
app.get('/',function (request, response) {
	
	console.log('request from ' + getClientAddress(request) + " " + request.url);
	response.sendFile( __dirname + '/html/index.html')

});

// serves static files 
app.get(/^(.+)$/, function(req, res){ 
     res.sendFile( __dirname +"/html/"+ req.params[0]); 
});

// handle the request from contact form submission
app.post('/process_post', urlencodedParser, function (req, res, next) {


    var _response = {
       name:req.body.name,
       email:req.body.email,
       phone:req.body.phone,
       update:req.body.subscribe,
       message:req.body.message,
       recaptcha: req.body.recaptcha
    };

    remoteip = getClientAddress(req);

    verifyRecaptcha(_response.recaptcha, remoteip, function(success) {
        var s = 1
        if (s==1) {
      
              validphone = validPhone();
              validemail = validateEmail();

              if (_response.name == '' || (!validemail) || (!validphone)) {
                
                  console.log("[WARN]: enter error page!!!!");
                  if(err){
                    console.log(err);
                  }else{
                        
                      var data = {"message":"error"};
                      res.send(data);
                  }
                  
              }else {

                  var title = 'Message from potential client: ' + _response['name'];
                  var message = 'email: ' + _response['email'] + '\n' +
                                'phone: '+ _response['phone'] + '\n' + 
                                'update: ' + _response['update'] + '\n' + 
                                'message: \n\n' + _response['message'] + '\n';
                  var sender = '10X Soccer<10xsoccerperformance@gmail.com>';
                  var recipients = '10X Soccer Performance<10xsoccerperformance@gmail.com>';
                  
                  var email_setup = {
                    from: sender,
                    to: recipients,
                    subject: title,
                    text: message
                  };
                  
                  console.log("［INFO]: Sending email to " + recipients)
                  
                  mailgun.messages().send(email_setup, function (error, body) {
                      if (error) {
                            console.log('[WARN]: failed to send ' + error);
                      }
                      else {
                        console.log(body)
                        var data = {"message":"success"};
                        res.send(data);
                      }
                  });
              }
        }
        //if re-captcha fails
        else {
              console.log("[WARN]: enter recaptcha fails")
              data = {"message":"error"};
              res.send(data);
        }
    });
	 


  	function validateEmail() {
  		var isValidEmail = true;
  		if (_response["email"] == '') {
  			isValidEmail = false;
  		}
  		else if (_response["email"].toString().indexOf("@") < 0) {
  			isValidEmail = false;
  		}
  		return isValidEmail;
  	};


  	function validPhone() {
  		  var isValidPhoneNumber = true;
  		  exp = /\d/;
  		
        if (_response["phone"] == '') {
          isValidPhoneNumber = true;
        }
        else if (!exp.test(_response["phone"].toString())){
  			 isValidPhoneNumber = false;
  		  }
  		  return isValidPhoneNumber;
  	};


    function verifyRecaptcha(key, remoteip, callback) {
      var SECRET = "6Lf_vSETAAAAAET5V7yNLOKSxVRD2fsKMOP0oBFD";

      https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key + "&remoteip="+remoteip, function(res) {
          var data = "";
          res.on('data', function (chunk) {
              data += chunk.toString();
          });
          res.on('end', function() {
              try {
                  var parsedData = JSON.parse(data);
                  console.log(parsedData);
                  callback(parsedData.success);
              } catch (e) {
                  callback(false);
              }
          });
      });
    };

});

// [ End Request Handlers Region ]


// [START server]
if (module === require.main) {
    var server = app.listen(server_port, server_ip_address, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
    console.log('Press Ctrl+C to quit.');

  });
}

// [END server]
module.exports = app;
