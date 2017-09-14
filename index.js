// JERRY 170914

const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const fs = require('fs')
const url = require('url')
const colors = require('colors')

const mongodbUrl = 'mongodb://localhost:27017/flowdesk'
const app = express()

app.use(bodyParser.json({ type: 'application/json' }))

app.get('/', function (req, res) {
	fs.readFile("index.html", function(err, data){
			if(err){
				console.log(err)
				res.writeHead(500, {'Content-Type': 'text/html'})
			} else {
				res.writeHead(200, {'Content-Type': 'text/html'})
				res.write(data.toString())
				res.end()
			}
		})  
})

app.post('/addposts', function(req, res){
	var result = {}
	var posts = req.body.posts
	console.log("post request accepted")
	console.dir(posts)
	MongoClient.connect(mongodbUrl, function(err,db){
		console.log("connecting mongodb")
		if(err) throw err
		db.collection("posts").insertMany(posts, function(err, res){
			console.log("inserting documents")
			if(err) throw err
			console.log("The number of posts inserted: " + res.insertedCount)
			db.close()
			console.log("closing mongodb")
		})
	})
})

app.listen(8081, function () {
  console.log('[LOG] Flowdesk server listening on port 8081'.yellow)
})






