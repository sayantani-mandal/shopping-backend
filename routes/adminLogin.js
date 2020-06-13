const express = require("express");
const { Admin } = require("../models/admin");
const adminAuth = require("../middleware/adminAuth");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let admin = await Admin.findOne({ email: req.body.email });
    if (!admin)
      return res.status(400).send({ Error: "admin is not registered" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      admin.password
    );
    if (!validPassword)
      return res.status(400).send({ Error: "Invalid password..." });

    const token = await admin.generateAuthToken();

    res.send({
      Succes: `Hello , you are successfully logged in with ${admin.email}`,
      token: token,
    });
  } catch (e) {
    res.status(402).send(e);
  }
});

router.get("/logout", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    admin.tokens = admin.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await admin.save();
    res.send({
      Success: `you are successfully logged out with ${admin.email}`,
    });
  } catch (e) {
    res.status(402).send(e);
  }
});

module.exports = router;
