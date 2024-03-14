
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const registerUser = asyncHandler(async (req, res) => {

    // get the user data from frontend
    // if the user is not existing then create a new one
    // upload the file in server then cloudinary
    // input validates
    // remove password and refresh token fields from response
    // check for user creation
    // return response

    const { fullName, email, userName, password } = req.body
    // console.log(fullName);
    if (
        [fullName, email, userName, password].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required!")
    }

    const userExist = User.findOne({
        $or: [{ userName }, { email }]
    })
    // console.log(userExist);
    if (userExist) {
        throw new ApiError(409, "user name or email already exists!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.avatar[0]?.path
    // console.log(avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required!")
    }

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

    const createdUser = await User.findById(user._id).select(
        "-password _refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

});


const loginUser = asyncHandler(async (req, res) => {
    const getUser = await User.findOne(req.body.userName)

    if (!getUser) {
        throw new ApiError(500, "not found user");
    }

    return res.status(201).json(
        new ApiResponse(200, getUser, "User registered successfully")
    )

});



export { registerUser, loginUser };