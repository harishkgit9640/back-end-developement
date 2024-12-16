import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(401, "name or description should not be empty !")
    }

    const playList = await Playlist.create({
        name,
        description,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playList, "Playlist Created successfully"));


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const playlists = await Playlist.find({
        owner: req.user._id
    })
    return res
        .status(201)
        .json(new ApiResponse(201, playlists, "Fetched All Playlists successfully"));

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const playlist = await Playlist.findById(playlistId)
    return res
        .status(200)
        .json(new ApiResponse(2001, playlist, "playlist fetched successfully!"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const addVideoToPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        videos: [videoId],
        owner: req.user._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, addVideoToPlaylist, "Video Added into the Playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user._id
    })
    const isVideoExist = playlist.videos.indexOf(videoId) !== -1

    return res
        .status(201)
        .json(new ApiResponse(201, addVideoToPlaylist, "Video Added into the Playlist successfully"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const deletedPlaylist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user?._id,
    })

    return res
        .status(200)
        .json(new ApiResponse(201, deletedPlaylist, "Playlist deleted Successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(401, "name or description should not be empty !")
    }

    const playList = await Playlist.findByIdAndUpdate(playlistId, {
        name,
        description,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playList, "Playlist Updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}