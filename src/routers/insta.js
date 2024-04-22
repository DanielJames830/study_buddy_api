const express = require("express");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const User = require("../models/user");
const { IgApiClient } = require("instagram-private-api");

const router = express.Router();

router.post("/user/sp/insta-post", auth, async (req, res) => {
  let user = req.user;
  let data = req.body;

  let result = await postToInsta(user.toJSON(), JSON.stringify(data));
  console.log(result);

  if (result === true) {
    res.status(201).send("instagram post created!");
  } else {
    res.status(400).send("unable to post to instagram");
  }
});

const postToInsta = async (user, data) => {
  data = JSON.parse(data);
  console.log(user.ig_username);
  console.log(user.ig_password);
  console.log(data.caption);
  console.log(data.image_url);

  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(user.ig_username);
    await ig.account.login(user.ig_username, user.ig_password);

    const imageBuffer = await get({
      url: data.image_url,
      encoding: null,
    });

    await ig.publish.photo({
      file: imageBuffer,
      caption: data.caption,
    });
    return true;
  } catch (e) {
    console.log("unable to post to instagram :(");
    return false;
  }
};

router.patch("/user/sp/insta", auth, async (reg, res) => {
  let user = reg.user;
  let body = reg.body;
  console.log(user);
  console.log(body);
  if (!mongoose.isValidObjectId(user._id)) {
    res.status(400).send("Invalid request");
    return;
  }
  console.log("sp user is valid");
  try {
    console.log(user._id);
    let spUser = await User.findById(user._id);
    console.log(spUser);
    if (!spUser) {
      res.status(400).send("User not found");
      return;
    }

    spUser.ig_username = body.ig_username.toString();
    spUser.ig_password = body.ig_password.toString();
    console.log("ig username:" + spUser.ig_username);
    console.log("ig password:" + spuser.ig_password);
    await spUser.save();
    res.send("Instagram info updated!");
  } catch (e) {
    res.status(400).send("unable to add instagram info");
  }
});
