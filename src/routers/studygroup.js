const express = require("express");
const auth = require("../middleware/auth");

const StudyGroup = require("../models/studygroup");
const mongoose = require("mongoose");
const User = require("../models/user");
const router = express.Router();

router.post("/studygroup", auth, async (req, res) => {
	delete req.body.owner;
	delete req.body.participants;

	console.log(req);

	const user = req.user;

	try {
		const group = new StudyGroup({
			...req.body,
			owner: user._id,
		});

		await group.save();
		res.status(201).send();
	} catch (error) {
		console.log(error);
		res.status(400).send();
	}
});

router.get("/studygroups", auth, async (req, res) => {
	let filter = {
		$and: [],
	};
	const projection = {
		name: 1,
		is_public: 1,
		max_participants: 1,
		description: 1,
		owner: 1,
		start_date: 1,
		end_date: 1,
		meeting_times: 1,
		school: 1,
		course_number: 1,
		participants: 1
	};
	const options = {};

	filter.$and.push({
		$or: [{ is_public: true }, { owner: req.user._id }],
	});

	if (req.query.hasOwnProperty("ongoing")) {
		const now = new Date();
		if (req.query.ongoing === "true") {
			filter.$and.push({ start_date: { $lte: now } });
			filter.$and.push({ end_date: { $gt: now } });
		} else {
			filter.$and.push({
				$or: [{ start_date: { $gt: now } }, { end_date: { $lt: now } }],
			});
		}
	}

	if (req.query.hasOwnProperty("mine")) {
		console.log("has property");
		if (req.query.mine === "true") {
			filter.$and.push({ owner: { $eq: req.user._id } });
		} else {
			filter.$and.push({
				$or: [
					{ owner: { $eq: req.user._id } },
					{ owner: { $ne: req.user._id } },
				],
			});
		}
	}

	if (req.query.hasOwnProperty("search")) {
		filter.$and.push({
			$text: {
				$search: req.query.search,
			},
		});
	}

	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(":");
		options.sort = {};
		options.sort[parts[0]] = parts[1] == "asc" ? 1 : -1;
	}

	if (req.query.limit) {
		options.limit = req.query.limit;
	}

	if (req.query.skip) {
		options.skip = req.query.skip;
	}

	try {
		const results = await StudyGroup.find(filter, projection, options);
		res.send(results);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

router.patch("/studygroup/:id", auth, async (req, res) => {
	const user = req.user;
	const studyGroupID = req.params.id;
	const mods = req.body;
	let studygroup = undefined;
	if (!mongoose.isValidObjectId(studyGroupID)) {
		res.status(400).send("Invalid object id");
		return;
	}
	try {
		studygroup = await StudyGroup.findById(studyGroupID);
		if (!studygroup) {
			res.status(400).send("Invalid study group id");
			return;
		}
	} catch (e) {
		res.status(500).send("Error finding study group");
		return;
	}
	// verity user is owner
	if (!studygroup.owner.equals(user._id) && !studygroup.is_public) {
		res.status(401).send("Server is down for maintenance");
		return;
	}
	const props = Object.keys(mods);
	const modifiable = [
		"name",
		"is_public",
		"max_participants",
		"start_date",
		"end_date",
		"description",
		"school",
		"course_number",
		"participants",
		"meeting_times",
	];
	// check that all the props are modifable
	const isValid = props.every((prop) => modifiable.includes(prop));
	if (!isValid) {
		res.status(400).send("One or more invalid properties " + prop);
		return;
	}
	try {
		if (req.query.hasOwnProperty("ongoing")) {
			const now = new Date();
			if (req.query.ongoing === "true") {
				filter.$and.push({ start_date: { $lte: now } });
				filter.$and.push({ end_date: { $gt: now } });
			} else {
				filter.$and.push({
					$or: [{ start_date: { $gt: now } }, { end_date: { $lt: now } }],
				});
			}
		}

		props.forEach((prop) => (studygroup[prop] = mods[prop]));
		await studygroup.save();
		res.send(studygroup);
	} catch (e) {
		console.log(e);
		res.status(500).send("Error saving study group");
	}
});

router.patch("/studygroup/:id/participants", auth, async (req, res) => {
	const user = req.user;
	const studyGroupID = req.params.id;
	const mods = req.body;
	let studygroup = undefined;
	if (!mongoose.isValidObjectId(studyGroupID)) {
		res.status(400).send("Invalid object id");
		return;
	}
	try {
		studygroup = await StudyGroup.findById(studyGroupID);
		if (!studygroup) {
			res.status(400).send("Invalid study group id");
			return;
		}
	} catch (e) {
		res.status(500).send("Error finding study group");
		return;
	}
	// verity user is owner
	if (!studygroup.owner.equals(user._id) && !studygroup.is_public) {
		res.status(401).send("Server is down for maintenance");
		return;
	}

	try {

		if (req.query.hasOwnProperty("add")) {
			if (req.query.add === "true") {

				// if (studygroup["participants"].length >= studygroup["max_participants"]) {
				// 	res.status(401).send("This group is full");
				// 	return;
				// } else {
				 	studygroup["participants"].push(req.body.user)
				// }
			}
		}

		if (req.query.hasOwnProperty("remove")) {
			if (req.query.remove === "true") {
				studygroup["participants"].splice(studygroup['participants'].indexOf(req.body.user));
			}
		}

		await studygroup.save();
		res.send(studygroup);
	} catch (e) {
		console.log(e);
		res.status(500).send("Error saving study group");
	}
});

router.get("/studygroup/:id/participants", auth, async (req, res) => {
    const user = req.user;
    const studyGroupID = req.params.id;
    
    let studygroup = undefined;
    if (!mongoose.isValidObjectId(studyGroupID)) {
        res.status(400).send("Invalid object id");
        return;
    }
    try {
        studygroup = await StudyGroup.findById(studyGroupID);
        if (!studygroup) {
            res.status(400).send("Invalid study group id");
            return;
        }

        let owner = await User.findById(studygroup.owner);
        if (!owner) {
            res.status(400).send("Invalid owner id");
            return;
        }

        let filter = {
            _id: { $in: studygroup.participants },
        };

        const projection = {
            username: 1,
            _id: 1,
        };

        const participants = await User.find(filter, projection);

        const response = {
            owner: owner.username,
            participants: participants,
        };

        res.status(200).json(response);

    } catch (e) {
        res.status(500).send("Error finding study group");
        return;
    }
});


router.delete('/studygroup/:id', auth, async (req, res) => {
	const user = req.user
	const studyGroupId = req.params.id

	let studyGroup = null

	if(!mongoose.isValidObjectId(studyGroupId)) {
		res.status(400).send("Invalid request")
		return
	}

	try {
		studyGroup = await StudyGroup.findById(studyGroupId)

		if (!studyGroup){
			res.status(400).send("Study Group not found.")
			return
		}

		if (!studyGroup.owner.equals(user._id)) {
			res.status(401).send()
			return
		}

		await studyGroup.deleteOne()

		res.send()
	}
	catch(e) {
		console.log(e)
		res.status(500).send()
	}
})

module.exports = router;
