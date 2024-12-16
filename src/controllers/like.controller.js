import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.models.js"
import { Comment } from "../models/comment.models.js"
import { Video } from "../models/video.models.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const comment = await Comment.findById({ _id: videoId })

    if (!comment) throw new ApiError(404, "Not Found");

    const isAlReadyLiked = await Like.findOne({
        _id: videoId,
        likedBy: req.user._id
    })

    if (isAlReadyLiked) {
        await Like.findByIdAndDelete({
            _id: videoId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: false }, "unLiked successfully"));

    } else {

        await Like.create({
            _id: videoId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Liked successfully"));

    }

})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const comment = await Comment.findById({ _id: commentId })

    if (!comment) throw new ApiError(404, "Not Found");

    const isAlReadyLiked = await Like.findOne({
        _id: commentId,
        likedBy: req.user._id
    })

    if (isAlReadyLiked) {
        await Like.findByIdAndDelete({
            _id: commentId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: false }, "unLiked successfully"));

    } else {

        await Like.create({
            _id: commentId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Liked successfully"));


    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    const tweet = await Tweet.findById({ _id: tweetId })

    if (!tweet) throw new ApiError(404, "Not Found");

    const isAllReadyLiked = await Like.findOne({
        _id: tweetId,
        likedBy: req.user._id
    })

    if (isAllReadyLiked) {
        await Like.findByIdAndDelete({
            _id: tweetId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: false }, "unLiked successfully"));

    } else {

        await Like.create({
            _id: tweetId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Liked successfully"));
    }

});

const getLikedVideos = asyncHandler(async (req, res) => {

    const isAllReadyLiked = await Video.find({
        likedBy: req.user._id
    })

    if (!isAllReadyLiked) new ApiError(404, "Not Record Found")

    return res.status(200).json(new ApiResponse(201, isAllReadyLiked, "All Liked Videos"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}