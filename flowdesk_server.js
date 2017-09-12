// JERRY 170610
// 170617 - POST interaction added
//

var http = require('http');
var fs = require('fs');
var url = require('url');

//var MongoClient = require('mongodb').MongoClient;
//var assert = require('assert');
//var mongodbUrl = 'mongodb://localhost:27017/flowdesk';

var server = http.createServer(function(request, response){
	var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received.");
	if(request.method == 'GET'){
		if(pathname == "/"){
			pathname = "/index.html";
		} 
		fs.readFile(pathname.substr(1), function(err, data){
			if(err){
				console.log(err);
				response.writeHead(404, {'Content-Type': 'text/html'});
			} else {
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write(data.toString());
				response.end();
			}
		});
	} else if (request.method == 'POST'){
		request.on('data', function(chunk) { 
			console.log("chunk data is as follows");
			console.log(chunk.toString()); 
			//var data = url.parse(chunk.toString()).contents; 
			var data = {"contents" : chunk.toString()};
			var storedPosts;
			MongoClient.connect(mongodbUrl, function(err, db){
				assert.equal(null, err);
				console.log("Connected correctly to 'flowdesk' DB.");
				db.collection("posts").save(data);
				storedPosts = db.collection("posts").find();
				db.close();
			});

			response.writeHead(200, {'Content-Type':'text/html'}); 
			response.end(' contents : ' + storedPosts); 
		});
		request.on('error', function(err){
			console.log(error);
		});
	}
});

server.listen(8081);

console.log('Server running at http://127.0.0.1:8081/');








