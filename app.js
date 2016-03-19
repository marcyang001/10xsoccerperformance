var express = require('express');
var fs = require('fs');
var os = require('os');
var path = require('path');


var app = express();

function getClientAddress(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}


app.get('/',function (request, response) {
	
	console.log('request from' + getClientAddress(request) + " " + request.url);
	response.sendFile( __dirname + '/index.html')

	/*
	console.log('request from' + getClientAddress(request) + " " + request.url);
	var filePath = '.' + request.url;
	if (filePath == './')
		filePath = './index.html';
		
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	
	fs.exists(filePath, function(exists) {
	
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});
	*/
});

/* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     console.log('other files : ' + req.params);
     res.sendFile( __dirname + req.params[0]); 
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

