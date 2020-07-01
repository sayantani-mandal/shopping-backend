const express = require("express");
const auth = require("../middleware/auth");
const _ = require("lodash");
const { User } = require("../models/user");
const generateOtp = require("../source/otp");
const sendEmail = require("../source/sendMail");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ Error: "user is not registered" });

    const token = await user.generateAuthToken();
    const otp = generateOtp(req.body.email);
    console.log(otp);
    sendEmail(user.email, otp);

    user = await User.findByIdAndUpdate(
      user._id,
      { $set: { otp: otp, expiredTime: Date.now() } },
      { new: true }
    );

    //   res.header('x-auth-token', token).send({Succes:`Hello ${user.firstName} , OTP is delivered to your EMAIL`});
    res.send({
      Succes: `Hello ${user.firstName} , OTP is delivered to your EMAIL`,
      token: token,
      otp: otp,
    });
  } catch (e) {
    res.status(402).send(e);
  }
});

router.get("/show", auth, async (req, res) => {
  try {
    const getOtp = req.header("otp");
    if (!getOtp) return res.status(401).send({ Error: "no OTP provided" });
    console.log(req.user);
    const id = req.user._id;
    const user = await User.findById(id);
    if (!user) return res.status(400).send({ Error: "Invalid token provided" });

    if (getOtp != user.otp || Date.now() - user.expiredTime > 1000 * 60 * 60)
      return res.status(400).send({ Error: "Invalid OTP provided" });

    res.send({ Succes: ` ${user.firstName} , you are logged in successfully` });
  } catch (e) {
    res.status(402).send(e);
    console.log(e);
  }
});

// router.post("/show", auth, async (req, res) => {
//   try {
//     const getOtp = await User.findOne({ otp: req.body.otp });
//     console.log(getOtp);
//     console.log(req.user);
//     const id = req.user._id;
//     const user = await User.findById(id);
//     if (!user) return res.status(400).send({ Error: "Invalid token provided" });

//     if (
//       getOtp != user.otp ||
//       Date.now() - user.expiredTime > 1000 * 60 * 60 * 5
//     )
//       return res.status(400).send({ Error: "Invalid OTP provided" });

//     res.send({ Succes: ` ${user.firstName} , you are logged in successfully` });
//   } catch (e) {
//     res.status(402).send(e);
//     console.log(e);
//   }
// });

router.get("/logout", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.tokens = user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await user.save();
    res.send({
      Success: `${user.firstName} , you are successfully logged out`,
    });
  } catch (e) {
    res.status(402).send(e);
  }
});

router.post("/logoutall", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.tokens = [];
    await user.save();
    res.send({
      Success: `${user.firstName} , you are successfully logged out from all`,
    });
  } catch (e) {
    res.status(402).send(e);
  }
});

module.exports = router;
