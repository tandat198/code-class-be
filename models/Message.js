const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        room: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Room",
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        text: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

MessageSchema.method("transform", function () {
    const obj = this.toObject();

    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

const Message = new mongoose.model("Message", MessageSchema);

module.exports = {
    MessageSchema,
    Message,
};
