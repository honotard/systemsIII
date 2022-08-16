var express = require("express");

var router = express.Router();

router.get("/", function(req, res){
    res.json("This is json status for users api");

});

module.exports = router;