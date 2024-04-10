const express = require("express");
const auth = require("../middleware/auth");

const Notification = require("../models/notification");
const mongoose = require("mongoose");
const User = require("../models/user");
const router = express.Router();

router.post("/notification", auth, async (req, res) => {

    const receiverId = req.body.receiver;

    if (!mongoose.isValidObjectId(receiverId)) {
        console.log(receiverId)
		res.status(400).send("Invalid object id");
		return;
	}

	try {
        
		const notification = new Notification({
			...req.body,
		});

        user = await User.findById(receiverId);
        if (!user) {
			res.status(400).send("Invalid recipiant ID");
			return;
		}

        if(user['notifications'] === null) {
            user['notifications'] = []
        }

      

		await notification.save();
        user['notifications'].push(notification._id)
        
        await user.save();

		res.status(201).send(notification);
	} catch (error) {
		console.log(error);
		res.status(400).send();
	}
});

module.exports = router