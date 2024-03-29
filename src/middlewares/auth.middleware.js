import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";


const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // console.log(req.cookies)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request!")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log(decodedToken);

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        req.user = user
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access Token!")
    }
})

export { verifyJWT }