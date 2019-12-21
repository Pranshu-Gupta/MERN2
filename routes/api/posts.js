const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    POST api/posts
//@desc     Create a post
//@access   Private

router.post(
  '/',
  // @ts-ignore
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // @ts-ignore
    const { text } = req.body;
    if (!errors.isEmpty())
      // @ts-ignore
      return res.status(400).json({ errors: errors.array() });
    try {
      // @ts-ignore
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        text: text,
        // @ts-ignore
        name: user.name,
        // @ts-ignore
        avatar: user.avatar,
        // @ts-ignore
        user: req.user.id
      });
      const post = await newPost.save();
      // @ts-ignore
      res.json(post);
    } catch (err) {
      console.error(err.message);
      // @ts-ignore
      res.status(500).send('Server Error');
    }
  }
);

//@route    GET api/posts
//@desc     Get all post
//@access   Private

// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    GET api/posts/:id
//@desc     Get from individual id post
//@access   Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found!' });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Post not found!' });
    res.status(500).send('Server Error');
  }
});

//@route    DELETE api/posts/:id
//@desc     DELETE a post
//@access   Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found!' });

    //Check User
    // @ts-ignore
    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'user not authorised' });
    await post.remove();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId')
      return res.status(404).json({ msg: 'Post not found!' });
    res.status(500).send('Server Error');
  }
});

//@route    PUT api/posts/like/:id
//@desc     Like a post
//@access   Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been liked
    if (
      // @ts-ignore
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(404).json({ msg: 'Post already liked' });
    }
    // @ts-ignore
    post.likes.unshift({ user: req.user.id });
    await post.save();
    // @ts-ignore
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    PUT api/posts/unlike/:id
//@desc     UnLike a post
//@access   Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been liked
    if (
      // @ts-ignore
      post.likes.filter(like => like.user.toString() === req.user.id).length ==
      0
    ) {
      return res.status(404).json({ msg: 'Post has not been liked' });
    }
    // @ts-ignore
    const removeIndex = post.likes
      .map(like => like.user.toString())
      // @ts-ignore
      .indexOf(req.user.id);
    // @ts-ignore
    post.likes.splice(removeIndex, 1);
    await post.save();
    // @ts-ignore
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    POST api/posts/comment/:id
//@desc     Comment on a post
//@access   Private

router.post(
  '/comment/:id',
  // @ts-ignore
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { text } = req.body;
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: text,
        // @ts-ignore
        name: user.name,
        // @ts-ignore
        avatar: user.avatar,
        user: req.user.id
      };
      // @ts-ignore
      post.comments.unshift(newComment);
      await post.save();
      // @ts-ignore
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route    DELEYE api/posts/comment/:id/:comment_id
//@desc     Comment on a post
//@access   Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Pull out the comment
    // @ts-ignore
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    //Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    //Check user
    // @ts-ignore
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'user not authorised' });

    // @ts-ignore
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      // @ts-ignore
      .indexOf(req.user.id);
    // @ts-ignore
    post.comments.splice(removeIndex, 1);
    await post.save();
    // @ts-ignore
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
