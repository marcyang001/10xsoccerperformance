var express = require('express');
var fs = require('fs');
var os = require('os');
var path = require('path');
var bodyParser = require('body-parser');

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

app.post('/process_post', urlencodedParser, function (req, res) {

	console.log(req.url);
   // Prepare output in JSON format
   response = {
       name:req.body.name,
       email:req.body.email,
       phone:req.body.phone,
       update:req.body.update,
       message:req.body.message
   };

   
   	

   	validphone = validPhone();
	validemail = validateEmail();

    if (response.name == '' && (!validphone || !validemail)) {
   		fs.readFile(__dirname + '/html/messageFailed.html', function(err, html){
            if(err){
                console.log(err);
            }else{
                res.write(html);
                res.end();
            }
        });

   	}else {
   		fs.readFile(__dirname + '/html/messageReceived.html', function(err, html){
            if(err){
                console.log(err);
            }else{
                
            	//send the message through MailGun
                res.write(html);
                res.end();
            }
        });

   	}
  	

  	function validateEmail() {
  		var a = true;
  		if (response["email"] == '') {
  			a = false;
  		}
  		else if (response["email"].toString().indexOf("@") < 0) {
  			a = false;
  		}
  		
  		return a;
  	}

  	function validPhone() {
  		var a = true;
  		exp = /\d/;
  		if (!exp.test(response["phone"].toString())){
  			a = false;
  		}
  		
  		return a

  	}
   
   
});

/* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     console.log('other files : ' + req.params);
     res.sendFile( __dirname +"/html/"+ req.params[0]); 
 });





if (module === require.main) {
  // [START server]
  // Start the server
  	var server = app.listen(process.env.PORT || 8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);

  });
  // [END server]
}

module.exports = app;

