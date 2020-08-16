const { Mentor } = require("../../../models/Mentor");
const { User } = require("../../../models/User");
const ObjectId = require("mongoose").Types.ObjectId;

const getMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find().populate("user").select("-password -savedTutorials -tasks");

        mentors.forEach((m, i) => {
            mentors[i] = m.transform();
            delete m.user.password;
            delete m.user.savedTutorials;
            delete m.user.tasks;
        });

        return res.status(200).json(mentors);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getOneMentor = async (req, res) => {
    const { mentorId } = req.params;
    if (!ObjectId.isValid(mentorId)) return res.status(400).json({ mentorId: "mentorId is valid" });

    try {
        const mentor = await Mentor.findById(mentorId).populate("user");
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });
        delete mentor.user.password;
        delete mentor.user.savedTutorials;
        delete mentor.user.tasks;

        return res.status(200).json(mentor.transform());
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createMentor = async (req, res) => {
    const { userId, numberOfYearsExperience, currentJob, specialities } = req.body;
    const errors = {};
    const validatedFields = ["userId", "numberOfYearsExperience", "currentJob", "specialities"];
    const regExpTestJob = RegExp(
        "Front-end Developer|Back-end Developer|Web Developer|Mobile Developer|Full-stack Developer"
    );

    validatedFields.forEach((field) => {
        if (!req.body[field]) errors[field] = `${field} is required`;
    });
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (!ObjectId.isValid(userId)) errors.userId = "userId is invalid";
    if (typeof numberOfYearsExperience != "number" || numberOfYearsExperience % 0.5 != 0) {
        errors.numberOfYearsExperience = "numberOfYearsExperience is invalid";
    }
    if (typeof currentJob != "string" || !regExpTestJob.test(currentJob)) {
        errors.currentJob = "currentJob is invalid";
    }
    if (!Array.isArray(specialities) || [...new Set(specialities)].length != specialities.length) {
        errors.specialities = "specialities is invalid";
    }
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ userId: "user not found" });
        const newMentor = new Mentor({
            user,
            numberOfYearsExperience,
            currentJob,
            specialities,
        });
        await newMentor.save();
        delete user.password;
        delete user.savedTutorials;
        delete user.tasks;

        return res.status(201).json({
            ...newMentor.transform(),
            user,
        });
    } catch (error) {
        if(error.code == 11000) return res.status(400).json({ userId: "this user has already been mentor" });
        return res.status(500).json(error);
    }
};

const updateMentor = async (req, res) => {
    const { userId, numberOfYearsExperience, currentJob, specialities } = req.body;
    const { mentorId } = req.params;
    const errors = {};
    const validatedFields = ["userId", "numberOfYearsExperience", "currentJob", "specialities"];
    const regExpTestJob = RegExp(
        "Front-end Developer|Back-end Developer|Web Developer|Mobile Developer|Full-stack Developer"
    );

    if (!ObjectId.isValid(mentorId)) errors.mentorId = "mentorId is invalid";

    validatedFields.forEach((field) => {
        if (!req.body[field]) errors[field] = `${field} is required`;
    });
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    if (!ObjectId.isValid(userId)) errors.userId = "userId is invalid";
    if (typeof numberOfYearsExperience != "number" || numberOfYearsExperience % 0.5 != 0) {
        errors.numberOfYearsExperience = "numberOfYearsExperience is invalid";
    }
    if (typeof currentJob != "string" || !regExpTestJob.test(currentJob)) {
        errors.currentJob = "currentJob is invalid";
    }
    if (!Array.isArray(specialities) || [...new Set(specialities)].length != specialities.length) {
        errors.specialities = "specialities is invalid";
    }
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ userId: "userId is invalid" });

        await Mentor.updateOne({ _id: mentorId }, { user, numberOfYearsExperience, currentJob, specialities });

        return res.status(200).json({ message: "Updated mentor successfully" });
    } catch (error) {
        return res.status(500).json(error);
    }
};

const deleteMentor = async (req, res) => {
    const { mentorId } = req.params;

    if (!ObjectId.isValid(mentorId)) errors.mentorId = "mentorId is invalid";

    try {
        const mentor = await Mentor.findById(mentorId);
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });

        await Mentor.deleteOne({ _id: mentorId });
        return res.status(200).json({ message: "Deleted mentor successfully" });
    } catch (error) {}
};

module.exports = { getMentors, getOneMentor, createMentor, updateMentor, deleteMentor };
