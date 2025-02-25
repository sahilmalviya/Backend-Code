import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {       //RegisterUser
    res.status(200).json({
        message: "Done"
    })
})


export { 
    registerUser,

 }