const express = require("express");
const auth = require("../middleware/auth");

const Notification = require("../models/notification");
const mongoose = require("mongoose");
const User = require("../models/user");
const router = express.Router();

router.post("/notification", auth, async (req, res) => {
	const receiverId = req.body.receiver;

	if (!mongoose.isValidObjectId(receiverId)) {
		console.log(receiverId);
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

		if (user["notifications"] === null) {
			user["notifications"] = [];
		}

		await notification.save();
		user["notifications"].push(notification._id);

		await user.save();

		res.status(201).send(notification);
	} catch (error) {
		console.log(error);
		res.status(400).send();
	}
});

router.get("/notifications/:id/", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		const notifications  = user.notifications;

		if (!notifications || !Array.isArray(notifications)) {
			return res
				.status(400)
				.json({
					error: "Invalid notifications array provided in request body",
				});
		}

		// Query MongoDB for notifications with matching ids
		const foundNotifications = await Notification.find({
			_id: { $in: notifications },
		});

		foundNotifications.map(async (notification) => {
			notification['sender'] = await User.findById(notification['sender'])['username'];
		});

		res.json(foundNotifications);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
