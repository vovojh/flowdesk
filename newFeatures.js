//
// 170621
//
// 1. Sync : Load and Update - Text Only. Img data will be considered later.
// 2. Tag UI/UX
// 3. Tag Classification
// 4. img inside div
//



// 1. Sync : Load and Update - Text Only. Img data will be considered later.
var numbering = 0;

function Post(){
	this.tmpId = -1;
	this.id = "";			// unique id created by MongoDB
	this.author = "";		// 
	this.tags = [];
	this.text = ""; 		// Like innerHTML, this contains <img> tags
	this.img = [];  		// imgs will be restored at appropriate positions with texts 
	this.creationDate = new Date();
	this.sync = false;
}

function Author(){
	this.name = "";	// nickname
	this.id = "";	// account id
	this.signUpDate = new Date();
	this.authority = "";
	this.group = "";
}

var posts = [];

// when post is created (from create Btn) 
var tmpPost = new Post();
tmpPost.tmpId = numbering;
post_body.id = numbering;
numbering = numbering + 1;
posts.push();

// when the content of post is changed, the property "sync" of the post is set to false and the object is updated to contain changed contents
var tmpPostContent = "";
var tmpPostId = -1; // temporary ID
XX.onfocus = function(){
	tmpPostContent = this.innerHTML;
	tmpPostId = this.id;
}
XX.onblur = function(){
	var i, j;
	if(this.innerHTML != tmpPostContent){
		for(i = 0; posts.length; i++){
			if(posts[i].tmpId == tmpPostId){
				posts[i].text = this.innerHTML;
				var c = this.parentNode.childNodes; 
				var tmpTags = [];
				for(j = 0; c.length; j++){
					tmpTags.push(c[j].innerHTML);
				}
				posts[i].tags = tmpTags;
			}
		}
	}
}


// when sync button is clicked
var syncPostsId = [];	// a set of unnecessary posts to be fetched from DB 
var toBeSyncPosts = []; // an array of posts to be synchronized
var i;
for(i = 0; i < posts.length; i++){
	if(posts[i].sync == true){ 		
		if(syncPostsId.indexOf(posts[i].id) == -1) {
			syncPostsId.push(posts[i].id);
		}
	} else {
		toBeSyncPosts.push(posts[i]);
	}
}
var syncMsgObj = {"syncPostsId" : "", "toBeSyncPosts" : ""};
if(syncPostsId.length == 0) {
	syncMsgObj.syncPostsId = "none";
} else {
	syncMsgObj.syncPostsId = JSON.stringify(syncPostsId);
}
if(toBeSyncPosts.length == 0) {
	syncMsgObj.toBeSyncPosts = "none";
} else { // serializing nested object problem ?
	syncMsgObj.toBeSyncPosts = JSON.stringify(toBeSyncPosts);
}
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function(){
	if(this.readyState == 4 && this.status == 200){
		console.log("Sync request accepted successfully!");
		//TODO
		var receivedPosts = JSON.parse(this.responseText);
		var i;
		for(i = 0; i < receivedPosts.length; i++){
			receivedPosts[i].tmpId = numbering;
			// post_body creation code inserted
			post_body.id = numbering; 
			numbering = numbering + 1;
			posts.push(receivedPosts[i]); //TODO - to be expired right after the block ends?
		}
	} else { // sync fails and notification needed
		//
	}						
};
xhttp.open("POST", "", true);
xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
xhttp.send("syncPostsId=" + syncMsgObj.syncPostsId + "&" + "toBeSyncPosts=" + syncMsgObj.toBeSyncPosts);
console.log("AJAX Working");

// the property "sync" of synced posts must be changed to true after




// 2. Tag UI/UX
var sharpPressed = false;
var tmpPostContentForTag = "";
window.onkeydown = function(e){
	var code = e.keyCode? e.keyCode : e.which;
	console.log(code);
	if(code == 51 && sharpPressed == false){ 	// when "#" is typed	
		sharpPressed = true;
		tmpPostContentForTag = document.activeElement.innerHTML;
	} else if ((code == 51 || code == 13)&&sharpPressed == true)





// 3. Tag Classification - applied only to posts already in client-side (TODO - in server-side)
var searchTags = [];

// when search tag is added with keydown event
searchTags.push();
or
searchTags.pop();
->



// Focus first on completing UI ? ( easier and faster to be tested )















