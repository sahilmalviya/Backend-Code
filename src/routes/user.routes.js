import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";  // image upload k liye
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router ()


router.route("/register").post(      
    upload.fields([                             //isse image bhej skte hai
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name : "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)



export default router