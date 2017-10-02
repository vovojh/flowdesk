// JERRY 170914

const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const fs = require('fs')
const url = require('url')
const colors = require('colors')
const events = require('events')

var newPosts = []
var modifiedPosts = []

var updateEachPost = new events.EventEmitter()
updateEachPost.on('nextUpdate', function(db, idx, modifiedPosts, resp){
	console.dir(db)
	console.log("---------")
	console.log(idx)
	console.dir(modifiedPosts)
	db.collection("posts").updateOne({id: modifiedPosts[idx].id}, {contents: modifiedPosts[idx].contents}, function(err, res){
		if(err) throw err
		console.log("event emitter working.. number " + idx)
		if(idx < modifiedPosts.length - 1) {
			updateEachPost.emit('nextUpdate', db, idx+1, modifiedPosts)
		} else {
			console.log("finishing update chaining..")
			resp.writeHead(200, {'Content-Type': 'text/html'})
			resp.end()
			db.close()
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
		if(req.body.posts[i].new)
			newPosts.push(req.body.posts[i])
		else if(req.body.posts[i].dirty)
			modifiedPosts.push(req.body.posts[i])
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

/*

const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const fs = require('fs')
const url = require('url')
const colors = require('colors')
const events = require('events')

var updateEachPost = new events.EventEmitter()
updateEachPost.on('nextUpdate', function(db, i, modifiedPosts){
	db.collection("posts").updateOne({id: modifiedPosts[i].id}, {contents: modifiedPosts[i].contents}, function(err, res){
		if(err) throw err
		console.log("event emitter working.. number " + i)
		if(i < modifiedPosts.length - 1) updateEachPost.emit('nextUpdate', db, i+1, modifiedPosts)
		else db.close()
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
		db.collection("posts").find({}, function(err, result) {
		    if (err) throw err
		    console.log("result of /getpost : " + result)
		    dataToSend.posts = result
			res.write(JSON.stringify(dataToSend))
			res.end()
		    db.close()
  		});
	})
})

app.post('/syncposts', function(req, res){
	var i, newPosts = [], modifiedPosts = [], result = {}
	for(i=0;i<req.body.posts.length;i++){
		if(req.body.posts[i].new)
			newPosts.push(req.body.posts[i])
		else if(req.body.posts[i].dirty)
			modifiedPosts.push(req.body.posts[i])
	}
	MongoClient.connect(mongodbUrl, function(err,db){
		if(err) throw err
		db.collection("posts").insertMany(newPosts, function(err, res){
			if(err) throw err
			console.log("result of /syncposts : ")
			console.dir(res)
			var i = 0
			updateEachPost.emit('nextUpdate', db, i, modifiedPosts)
		})
	})
})

app.listen(8081, function () {
  console.log('[LOG] Flowdesk server listening on port 8081'.yellow)
})

*/
