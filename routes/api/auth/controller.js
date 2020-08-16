const bcrypt = require("bcryptjs");
const validator = require("validator");
const { User } = require("../../../models/User");
const { promisify } = require("util");
const hashPass = promisify(bcrypt.hash);
const dayjs = require("dayjs");
const createToken = require("../../../utils/createToken");

const signUp = async (req, res) => {
    const validatedFields = ["email", "password", "confirmPassword", "name"];
    const reqBody = req.body;
    const { email, name, password, confirmPassword, phoneNumber, dateOfBirth } = reqBody;
    const errors = {};

    for (let field of validatedFields) {
        if (!reqBody[field]) errors[field] = `${field} is required`;
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    if (password.length < 8) errors.password = "password is too weak";
    if (password !== confirmPassword) errors.confirmPassword = "password and confirmPassword does not match";
    if (!validator.isEmail(email)) errors.email = "email is not valid";
    if (phoneNumber && !validator.isMobilePhone(phoneNumber + "", "vi-VN")) {
        errors.phoneNumber = "phoneNumber is invalid";
    }
    if (dateOfBirth && !validator.isDate(dayjs(dateOfBirth).format("YYYY/MM/DD"))) {
        errors.dateOfBirth = "dateOfBirth is invalid";
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        const user = await User.findOne({ email });
        if (user) {
            errors.email = "email already exists";
            return res.status(400).json(errors);
        }
        const hash = await hashPass(password, 10);

        const newUser = new User({
            email,
            name,
            password: hash,
            phoneNumber,
            dateOfBirth: typeof dateOfBirth == "string" ? parseInt(dateOfBirth) : dateOfBirth,
        });
        await newUser.save();
        const { id, userType } = newUser;
        const token = await createToken({ id, email, name, userType, phoneNumber, dateOfBirth });
        return res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error });
    }
};

const signIn = async (req, res) => {
    const validatedFields = ["email", "password"];
    const errors = {};
    const { email, password } = req.body;
    for (let field of validatedFields) {
        if (!req.body[field]) errors[field] = `${field} is required`;
    }
    if (Object.keys(errors).length) return res.status(400).json(errors);

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ email: "Email does not exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(403).json({ password: "Password does not match" });

        user = user.transform();

        const { id, name, userType, phoneNumber, dateOfBirth } = user;
        const token = await createToken({ id, email, name, userType, phoneNumber, dateOfBirth });
        return res.status(200).json({
            token,
        });
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = { signIn, signUp };
