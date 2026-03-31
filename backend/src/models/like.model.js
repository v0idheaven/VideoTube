import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const hasExactlyOneLikeTarget = function () {
    const targets = [this.video, this.comment, this.tweet].filter(Boolean);

    return targets.length === 1;
};

likeSchema.path("likedBy").validate(
    hasExactlyOneLikeTarget,
    "A like must reference exactly one of video, comment, or tweet"
);

export const Like = mongoose.model("Like", likeSchema);
