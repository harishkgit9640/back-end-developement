import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // TODO: get all videos based on query, sort, pagination
    const allVideos = await Video.find();

    if (!allVideos) {
        throw new ApiError(400, "No Record found!")
    }

    return res.status(201).json(
        new ApiResponse(200, allVideos, "All videos fetched successfully")
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (
        [title, description].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "title, description are required!")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if (!videoFileLocalPath) {
        throw new ApiError(400, "videoFile is required!")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "videoFile is required!")
    }

    const videoData = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail?.url || "",
        duration: videoFile.duration,
        isPublished: false
    })

    if (!videoData) {
        throw new ApiError(500, "something went wrong while uploading video in database");
    }

    return res.status(201).json(
        new ApiResponse(200, videoData, "Video is uploaded successfully")
    )

});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // const { videoId } = req.body
    console.log(req.params);
    //TODO: get video by id
    const videoData = await Video.findOne({ $or: videoId });
    // const videoData = await Video.findOne();

    if (!videoData) {
        throw new ApiError(400, "No Record found!")
    }

    return res.status(201).json(
        new ApiResponse(200, videoData, "videos is fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}