import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    console.log(req.user.userName);

    if (!content) {
        throw new ApiError(401, "content should not be empty !")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet added successfully"));
});


const getUserTweets = asyncHandler(async (req, res) => {

    const user = req.user?._id;
    const tweets = await Tweet.find({ owner: user });
    return res
        .status(201)
        .json(new ApiResponse(201, tweets, "tweets are fetched successfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const tweetId = req.params.tweetId

    if (!content && !tweetId) {
        throw new ApiError(401, "content should not be empty !")
    }

    await Tweet.findByIdAndUpdate(tweetId, {
        content,
        owner: req.user._id
    });

    const tweet = await Tweet.findOne({ _id: tweetId })

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, tweet ? "Tweet updated successfully" : "there is no tweet available with id: " + tweetId));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    if (!tweetId) throw new ApiError(401, "Invalid tweet id");

    const deleted_tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user?._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, deleted_tweet, deleted_tweet ? "Tweet Deleted successfully" : "there is no tweet available with id: " + tweetId));

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}