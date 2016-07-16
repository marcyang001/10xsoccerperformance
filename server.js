var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var https = require('https');
// [START setup]
var api_key = 'key-4ad1de3b4cc58f18725c7ae4719cd0fe';
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
	
	console.log('request from' + getClientAddress(request) + " " + request.url);
	response.sendFile( __dirname + '/html/index.html')

});

app.post('/process_post', urlencodedParser, function (req, res, next) {

    response = {
       name:req.body.name,
       email:req.body.email,
       phone:req.body.phone,
       update:req.body.update,
       message:req.body.message,
       recaptcha: req.body["g-recaptcha-response"]
    };

    verifyRecaptcha(response.recaptcha, function(success) {
        if (success) {
          // TODO: do registration using params in req.body
            // Prepare output in JSON format
      

          validphone = validPhone();
          validemail = validateEmail();

          if (response.name == '' || ! validemail || (!validphone)) {
            fs.readFile(__dirname + '/html/messageFailed.html', function(err, html){
                  if(err){
                      console.log(err);
                  }else{
                      res.write(html);
                      res.end();
                  }
              });

          }else { 
              title = 'Message from sender: ' + response['name'];
              message = 'email: ' + response['email'] + '\n' +
                    'phone: '+ response['phone'] + '\n' + 
                    'update: ' + response['update'] + '\n' + 
                    'message: \n' + response['message'] + '\n';
            
            
            mg.sendText('10X<postmaster@sandbox89d24255fa0e44ba8d22681c98ff8234.mailgun.org>', ['10X Soccer Performance <10xsoccerperformance@gmail.com>'],
                    title,
                    message,
                    '10xsoccerperformance@gmail.com', {},
                    function(err) {
                      if (err) console.log('Oh noes: ' + err);
                      else {
                        fs.readFile(__dirname + '/html/messageReceived.html', function(err, html){

                          res.write(html);
                                res.end();
                        });
                      }
                  });
              

          }


        } else {
          fs.readFile(__dirname + '/html/messageFailed.html', function(err, html){
                  if(err){
                      console.log(err);
                  }else{
                      res.write(html);
                      res.end();
                  }
              });
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


    function verifyRecaptcha(key, callback) {
      var SECRET = "6Lf_vSETAAAAAET5V7yNLOKSxVRD2fsKMOP0oBFD";

      https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
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

