var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var https = require('https');
// [START setup]
var api_key = 'key-dd61880d10fe2238e4f11c024671f57e';
var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(api_key);

// [END setup]

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


var app = express();



function getClientAddress(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}


app.get('/',function (request, response) {
	
	console.log('request from ' + getClientAddress(request) + " " + request.url);
	response.sendFile( __dirname + '/html/index.html')

});

app.post('/process_post', urlencodedParser, function (req, res, next) {


    response = {
       name:req.body.name,
       email:req.body.email,
       phone:req.body.phone,
       update:req.body.subscribe,
       message:req.body.message,
       recaptcha: req.body.recaptcha
    };

    remoteip = getClientAddress(req);

    verifyRecaptcha(response.recaptcha, remoteip, function(success) {
        
        if (success) {
          // TODO: do registration using params in req.body
            // Prepare output in JSON format
      

              validphone = validPhone();
              validemail = validateEmail();

              if (response.name == '' || (!validemail) || (!validphone)) {
                
                  console.log("[WARN]: enter error page!!!!");
                  if(err){
                    console.log(err);
                  }else{
                        
                      data = {"message":"error"};
                      res.send(data);
                  }
                  

              }else { 
                
                  var title = 'Message from potential client: ' + response['name'];
                  var message = 'email: ' + response['email'] + '\n' +
                                'phone: '+ response['phone'] + '\n' + 
                                'update: ' + response['update'] + '\n' + 
                                'message: \n' + response['message'] + '\n';
                  
                  var recipients = ['10X Soccer Performance <10xsoccerperformance@gmail.com>'];
                  console.log("Sending email to " + recipients)
                
                  mg.sendText('10X Soccer<postmaster@sandbox89d24255fa0e44ba8d22681c98ff8234.mailgun.org>', 
                        recipients,
                        title,
                        message,
                        '10xsoccerperformance@gmail.com', {},
                        function(err) {
                          if (err) {
                            console.log('[WARN]: failed to send ' + err);
                          }
                          else {
                              data = {"message":"success"};
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
  		var a = true;
  		if (response["email"] == '') {
  			a = false;
  		}
  		else if (response["email"].toString().indexOf("@") < 0) {
  			a = false;
  		}
  		return a;
  	};


  	function validPhone() {
  		var a = true;
  		exp = /\d/;
  		
      if (response["phone"] == '') {
        a = true;
      }
      else if (!exp.test(response["phone"].toString())){
  			a = false;
  		}
  		return a
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

/* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     res.sendFile( __dirname +"/html/"+ req.params[0]); 
 });





if (module === require.main) {
  // [START server]
  // Start the server
  	var server = app.listen(server_port, server_ip_address, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
    console.log('Press Ctrl+C to quit.');

  });
  // [END server]
}

module.exports = app;

