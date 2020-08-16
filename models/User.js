const mongoose = require("mongoose");
const { TaskSchema } = require("./Task");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phoneNumber: String,
    dateOfBirth: Date,
    userType: {
        type: String,
        default: "client",
    },
    savedTutorials: [{ type: mongoose.Types.ObjectId, ref: "Tutorial" }],
    tasks: {
        type: [TaskSchema],
        default: [],
    },
    profileImageURL: String,
});

UserSchema.method("transform", function () {
    let obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const User = new mongoose.model("User", UserSchema);

module.exports = {
    UserSchema,
    User,
};
