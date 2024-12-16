import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
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

    const videoData = await Video.findOne({ _id: videoId });

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
    const { title, description } = req.body

    const video = await Video.findById(videoId);

    if (!video) throw new ApiError(404, "Video Not Found");

    if (
        [title, description].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "title, description are required!")
    }

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        console.log("i am here...");

        thumbnailLocalPath = req.files.thumbnail[0].path
    }
    console.log("local path : " + req.files + "path : " + thumbnailLocalPath);

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required!")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const videoData = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        thumbnail: thumbnail?.url || "",
    })

    if (!videoData) {
        throw new ApiError(500, "something went wrong while updating video in database");
    }

    return res.status(201).json(
        new ApiResponse(200, videoData, "Video Updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findByIdAndDelete({ $or: { _id: videoId, owner: req.user._id } })
    return res.status(200).json(new ApiResponse(200, video, "Video Deleted Successfully!"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById({ _id: videoId })

    if (!video) throw new ApiError(404, "Video Not Found");

    if (video.isPublished === true) {
        return res.status(200).json(new ApiResponse(200, { "isPublished": video.isPublished }, "Video Already Published Successfully!"));
    } else {
        const publishedVideo = await Video.findByIdAndUpdate(videoId, {
            isPublished: true,
            // owner: req.user._id,
        })
        return res.status(200).json(new ApiResponse(200, publishedVideo, "Video Published Successfully!"));
    }

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}