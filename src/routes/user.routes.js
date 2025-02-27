import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";  // image upload k liye


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

// router.route("/login").post(login)



export default router