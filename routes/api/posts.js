const express = require('express');
const router = express.Router();

//@route    GET api/posts
//@desc     Test route
//@access   Public/Private

router.get('/', (req,res)=> res.send('Post route'));

module.exports = router;