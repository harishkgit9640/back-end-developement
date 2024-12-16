import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    console.log(videoId);

    const user = req.user?._id;
    const allVideoComments = await Comment.find({
        videoId: videoId,
        owner: user
    });
    return res
        .status(201)
        .json(new ApiResponse(201, allVideoComments, "All Video Comments are fetched successfully"));


})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { videoId } = req.params

    if (!content) {
        throw new ApiError(401, "content should not be empty !")
    }

    const comment = await Comment.create({
        content,
        videoId: videoId,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const commentId = req.params.commentId

    if (!content && !commentId) {
        throw new ApiError(401, "content should not be empty !")
    }

    await Comment.findByIdAndUpdate(commentId, {
        content,
        // owner: req.user._id
    });

    const comment = await Comment.findOne({ _id: commentId })

    return res
        .status(201)
        .json(new ApiResponse(201, comment, comment ? "comment updated successfully" : "there is no commentId available with id: " + commentId));
});

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId

    if (!commentId) throw new ApiError(401, "Invalid commentId id");

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, comment ? "Comment Deleted successfully" : "there is no Comment available with id: " + commentId));

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}