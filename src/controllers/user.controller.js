import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {       //RegisterUser
    // get user details from frontend
    // validation - not empty
    // check if uer already exits: username , email
    // check for images, check for avatar
    // upload then to cloudinary
    // creater user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // step 1
    // get user details from frontend

    const { fullName, email, username, password } = req.body
    // console.log("email:", email);

    // Step 2 validation start

    // two way if condition 

    // if (fullName === ""){
    //     throw new ApiError(400, "fullname is required")
    // }

    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    // Step 2 validation end here


    // Step 3 check if uer already exits

    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (exitedUser) {
        throw new ApiError(409, "User with email or password already exists")
    }
    console.log(req.files);
    // Step 3 check if uer already exits  end here



    // Step 4 check for images, check for avatar start here
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path

    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    // Step 4 check for images, check for avatar End here



    // Step 5 upload then to cloudinary Start Here

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    // Step 5 upload then to cloudinary End Here



    // Step 6 creater user object - create entry in db Start here

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })    // Step 6 creater user object - create entry in db End here


    // Step 7 remove password and refresh token field from response

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Step 8 check for user creation

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )  // check for user creation End here




















})


export {
    registerUser,

}