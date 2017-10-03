// JERRY 170914

const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
const assert = require('assert')
const fs = require('fs')
const url = require('url')
const colors = require('colors')
const events = require('events')

var updateEachPost = new events.EventEmitter()
updateEachPost.on('nextUpdate', function(db, idx, modifiedPosts, resp){
	console.dir(db)
	console.log("---------")
	console.log(idx)
	console.dir(modifiedPosts)
	var query = { 
					_id : new ObjectId(modifiedPosts[idx].id)
				}
	var newValues = { 
						$set:   {
									tags : modifiedPosts[idx].tags, 
									contents: modifiedPosts[idx].contents, 
									modification_date: modifiedPosts[idx].modification_date,
									to_be_deleted : modifiedPosts[idx].to_be_deleted
								} 
					}
	db.collection("posts").updateOne(query, newValues, function(err, res){
		if(err) throw err
		console.log("event emitter working.. number " + idx)
		console.log("update result : ")
		console.dir(res)
		if(idx < modifiedPosts.length - 1) {
			updateEachPost.emit('nextUpdate', db, idx+1, modifiedPosts, resp)
		} else {
			console.log("finishing update chaining..")
			console.log("remove posts before closing db")
			var queryForDelete = { to_be_deleted : true }
			db.collection("posts").deleteMany(queryForDelete, function(err, obj) {
			    if (err) throw err;
			    resp.writeHead(200, {'Content-Type': 'text/html'})
				resp.end()
			    console.log(obj.result.n + " document(s) deleted");
			    db.close();
			});
		}
	})	
})

const mongodbUrl = 'mongodb://localhost:27017/flowdesk'
const app = express()

app.use(bodyParser.json({ type: 'application/json' }))

app.get('/', function (req, res) {
	fs.readFile("index.html", function(err, data){
		if(err){
			throw err
			res.writeHead(500, {'Content-Type': 'text/html'})
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'})
			res.write(data.toString())
			res.end()
		}
	})  
})

app.get('/getposts', function (req, res) {
	var dataToSend = {posts:[]}
	MongoClient.connect(mongodbUrl, function(err,db){
		if(err) throw err
		db.collection("posts").find({}).toArray(function(err, result) {
		    if (err) throw err
		    console.log("result of /getpost : ")
			console.dir(result)
			var i;
			for(i=0;i<result.length;i++)
				dataToSend.posts.push(result[i])
			console.log("dataToSend From \'getposts\' server")
			console.dir(dataToSend)
			res.writeHead(200, {'Content-Type': 'application/json'})
			res.write(JSON.stringify(dataToSend))
			res.end()
		    db.close()		    
  		});
	})
})

app.post('/syncposts', function(req, res){
	var i, newPosts = [], modifiedPosts = [];
	for(i=0;i<req.body.posts.length;i++){
		if(req.body.posts[i].new){
			delete req.body.posts[i].id
			newPosts.push(req.body.posts[i])
		} else if(req.body.posts[i].dirty){
			modifiedPosts.push(req.body.posts[i])
		}
	}
	MongoClient.connect(mongodbUrl, function(err,db){
		if(err) throw err
		if(newPosts.length == 0){
			if(modifiedPosts.length != 0){
				var idx = 0;
				updateEachPost.emit('nextUpdate', db, idx, modifiedPosts, res)
			} else {
				console.log("closing db")
				res.writeHead(200, {'Content-Type': 'text/html'})
				res.end()
				db.close()				
			}
		} else {
			db.collection("posts").insertMany(newPosts, function(err, result){
				if(err) throw err
				console.log("result of /syncposts : ")
				console.dir(result)
				var idx = 0
				if(modifiedPosts.length != 0){
					updateEachPost.emit('nextUpdate', db, idx, modifiedPosts, res)
				} else {
					console.log("closing db")
					res.writeHead(200, {'Content-Type': 'text/html'})
					res.end()
					db.close()				
				}
			})
		}
	})
})

app.listen(8081, function () {
  console.log('[LOG] Flowdesk server listening on port 8081'.yellow)
})

