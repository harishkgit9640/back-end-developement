import { Router } from "express";
import { registerUser, loginUser, logOutUser, incomingRefreshToken, changeCurrentPassword, getCurrentUser, getUserChannelProfile, updateUserAvatar, updateCoverImage, updateAccountDetails, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// user registration route
router.route('/register').post(upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), registerUser)
// user login route
router.route('/login').post(loginUser)
// secure route
router.route('/logout').post(verifyJWT, logOutUser)
router.route('/refresh-token').post(incomingRefreshToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)

//other routes
router.route('/get-user').get(verifyJWT, getCurrentUser)
router.route('/watch-history').get(verifyJWT, getWatchHistory)
router.route('/channel').get(verifyJWT, getUserChannelProfile)
router.route('/avatar').patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route('/cover-image').patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route('/update-account').patch(verifyJWT, updateAccountDetails)



export default router

