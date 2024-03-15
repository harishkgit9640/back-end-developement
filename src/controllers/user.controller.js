
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new Error(500, "something went wrong while generating access and refresh token")
    }
}


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


// user login route
const loginUser = asyncHandler(async (req, res) => {

    // get input data from user
    // match the input password
    // generate token and refresh token
    // store the data,token into cookie
    // validate the input data

    const { email, userName, password } = req.body
    // if (!email || !userName || !password) {
    //     throw new ApiError(400, "userName, email and password is required")
    // }
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(500, "User does not exist!");
    }
    // password validation
    const isPasswordValid = await User.isPasswordCorrect(password)

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
        .cookies("accessToken", accessToken, options)
        .cookies("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User Logged in successfully")
        )

});



export { registerUser, loginUser };