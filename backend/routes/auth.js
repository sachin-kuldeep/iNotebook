const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "skisgoodb$oy"

//Route-1: Create a User using: POST "/api/auth/createuser". No login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must have atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // if there are errors, return bad request and the errors
    let success =false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success=false
      return res.status(400).json({success, errors: errors.array() });
    }

    // check whether the user with this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user){
        success=false;
        return res.status(400).json({success, error: "Sorry a user with this email already exists" });
      }
      
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user:{
          id:user.id
        }
      }

      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authToken})
      // res.json(user);

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Inernal server error")
    }
  }
);



//Route-2: Authenticate a User using: POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blanked").exists()
  ],
  async (req, res) => {
    // if there are errors, return bad request and the errors
    let success =false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body
    try {
      let user = await User.findOne({email});
      if (!user){
        success =false
        return res.status(400).json({success, error: "Please login with correct credentials" });
      }
      
      const passCompare = await bcrypt.compare(password, user.password);
      if (!passCompare){
        success =false
        return res.status(400).json({success, error: "Please login with correct credentials" });
      }

      const data = {
        user:{
          id:user.id
        }
      }

      const authToken = jwt.sign(data, JWT_SECRET);
      success =true
      res.json({success, authToken})
      // res.json(user);

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Inernal server error")
    }
  }
);



//Route-3: Getting loggedin User details using: POST "/api/auth/getuser". Login required
router.post(
  "/getuser", fetchuser, async (req, res) => {
    try {
      const userId = req.user.id
      const user = await User.findById(userId).select("-password")
      res.send(user)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Inernal server error")
    }
  }
);

module.exports = router;
