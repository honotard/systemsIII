var express = require("express");
var multer= require("multer");
var crypto = require("crypto");
var path = require("path");


var ensureAuthenticated = require("../../auth/auth").ensureAuthenticated;

var Post = require("../../models/post");

var router = express.Router();


var storage = multer.diskStorage({
    destination:'./uploads/images/',
    filename: function(req, file, cb){
        crypto.pseudoRandomBytes(16, function(err, raw){
            cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname));
        });
    }
});

var upload = multer({storage:storage});

router.use(ensureAuthenticated);

router.get("/", function(req, res){
    Post.find({userID:req.user._id}).exec(function(err, posts){
        if(err){console.log(err);}

        res.render("post/posts", {posts:posts});
    });
 });


 router.get("/add", function(req, res){
    res.render("post/addpost");
 });

 router.post("/add", function(req, res){

    var newPost = new Post({
        title:req.body.title,
        content:req.body.content,
        userID:req.user._id
    });

    newPost.save(function(err,post){
        if(err){console.log(err);}
        res.redirect("/posts");
    });

 });

 //: means a route parameter it could be anything and it's often an ID
 // localhost:3000/posts/12345 --> fetch the post with id 12345
router.get("/:postId", function(req,res){
    Post.findById(req.params.postId).exec(function(err, post){
        res.render("post/detailpost",{post:post});
    });
});

router.get("/edit/:postId", function(req,res){
    Post.findById(req.params.postId).exec(function(err, post){
        res.render("post/editpost",{post:post});
    });
});

router.post("/update",upload.single('image'), async function(req, res){
     const post = await Post.findById(req.body.postid);
     
     post.title = req.body.title;
     post.content = req.body.content;
     post.image = req.file.path;

     // post.save()

     try {
         let savePost = await post.save();
         console.log("savepost", savePost);
         res.redirect("/posts/" + req.body.postid);

     } catch (err) {
         console.log("error happened");
         res.status(500).send(err);
     }

});


module.exports = router;