import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
    {
        userName: { type: String, required: true, trim: true, unique: true, lowercase: true, index: true },
        email: { type: String, required: true, trim: true, unique: true, lowercase: true },
        fullName: { type: String, required: true, trim: true, index: true },
        avatar: { type: String, required: true }, // cloudinary url
        coverImage: { type: String }, // cloudinary url
        watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
        password: { type: String, required: [true, "Password is required"] },
        refreshToken: { type: String }


    },
    { timestamps: true }
);

export const User = mongoose.model('User', userSchema);