import { Router } from "express";
import { registerUser, loginUser, logOutUser, incomingRefreshToken } from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// user registration route
router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser)

// user login route
router.route('/login').post(loginUser)

// secure route
router.route('/logout').post(verifyJWT, logOutUser)
router.route('/refresh-token').post(incomingRefreshToken)



export default router

