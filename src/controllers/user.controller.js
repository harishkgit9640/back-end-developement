import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

// user generate access and refresh token method
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new Error(500, "something went wrong while generating access and refresh token")
    }
}

// user registration method
const registerUser = asyncHandler(async (req, res) => {

    // get the user data from frontend
    // if the user is not existing then create a new one
    // upload the file in server then cloudinary
    // input validates
    // remove password and refresh token fields from response
    // check for user creation
    // return response

    const { fullName, email, userName, password } = req.body
    if (
        [fullName, email, userName, password].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required!")
    }

    // check if the user already exists
    const userExist = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (userExist) {
        throw new ApiError(409, "user name or email already exists!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required!")
    }

    // Image uploading and getting url
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required!")
    }

    // create object to send the data into database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById({ _id: user._id }).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

});

// user login method
const loginUser = asyncHandler(async (req, res) => {

    // get input data from user
    // match the input password
    // generate token and refresh token
    // store the data,token into cookie
    // validate the input data

    const { email, userName, password } = req.body

    if (!email || !userName || !password) {
        throw new ApiError(400, "userName, email and password is required")
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (!user) {
        throw new ApiError(500, "User does not exist!");
    }
    // password validation
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(500, "Incorrect password!");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User Logged in successfully")
        );

});

// logOut user method
const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true },
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200,
                {},
                "User Logged Out successfully")
        )

})

// re-login user with refresh token
const incomingRefreshToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized refresh token!")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findOne(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "invalid refresh token")
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Your refresh token has expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(
                { accessToken, refreshToken: newRefreshToken },
                "token refreshed successfully!"
            ))
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh token");
    }

})

// change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // if (newPassword !== confirmPassword) {
    //     throw new ApiError(401, "password should be matches with confirm password");
    // }

    const user = await User.find(req.user?._id)
    const isCorrectPassword = await user.isPasswordCorrect(oldPassword)

    if (!isCorrectPassword) {
        throw new ApiError(401, "Invalid old password")
    }

    user.password = newPassword
    user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password updated successfully"))
})

//get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

//update user account
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!email || !fullName) {
        throw new ApiError(400, "Invalid email and fullName")
    }
    const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set: { email: email, fullName: fullName }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "account Updated successfully"))
})

// update avatar image 
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "while uploading avatar file")
    }

    const updatedAvatar = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAvatar, "avatar updated successfully"))

})

// update cover image 
const updateCoverImage = asyncHandler(async (req, req) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "while uploading avatar file")
    }

    const updatedCoverImage = await findByIdAndUpdate(
        req.user?._id,
        { coverImage: coverImage.url },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedCoverImage, "Cover image updated successfully")
        )

})

// get subscribers
const subscription = asyncHandler(async (req, res) => {

    const userName = await User.findOne(req.param.userName);

    if (!userName?.trim()) {
        throw new ApiError(401, "UserName not found");
    }

    const channel = await User.aggregate[
        {
            $match: { userName: userName.toLowerCase() },
        },
        {
            $lookup: {
                from: "subscriptions",
                localFields: "_id",
                foreignFields: "channel",
                as: "subscribers"
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localFields: "_id",
                foreignFields: "subscriber",
                as: "subscribedTo"
            },
        },
        {
            addFields: {
                subscriberCount: { $size: "$subscribers" },
                channelSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            },

        },
        {
            $project: {
                userName: 1,
                fullName: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ]

    if (!channel?.length) {
        throw new ApiError("channel dose not exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "channel fetched successfully"))


})


export { registerUser, loginUser, logOutUser, incomingRefreshToken, changeCurrentPassword, getCurrentUser, subscription, updateUserAvatar, updateCoverImage, updateAccountDetails };