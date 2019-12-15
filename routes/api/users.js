const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

//@route    POST api/users
//@desc     Test route
//@access   Public/Private

router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid Email').isEmail(),
    check('password', 'Length of the password should be greater 6.').isLength({
      min: 6
    })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    res.send('User route');
  }
);

module.exports = router;
