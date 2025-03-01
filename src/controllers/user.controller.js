import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

// Access Token and Refresh Token Generate
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "something went wrong while generatinng refresh and access token")

    }
}

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



// login functionality

const loginUser = asyncHandler(async (req, res) => {
    // req body se data lao
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie
    // response for login 

    // Step 1   req body se data lao

    const { email, username, password } = req.body
    // console.log(email);

   
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }


        // Step 3 find the user
        const user = await User.findOne({
            $or: [{username}, {email}]
        })

        if (!user) {
            throw new ApiError(404, "user does not exist")
        }

        // Step 4 password check
        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            console.log('password mismatch')
            throw new ApiError(401, "Invalid user credentials")
        }  // Step 4 password check End here


        // Step 5 access and refresh token

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)


        const loggedInUser = await User.findById(user._id).   //Optional
            select("-password -refreshToken")


        // Step 6 send cookie

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200,
                    {
                        user: loggedInUser, accessToken,
                        refreshToken

                    },
                    "User Logged In Successfully"
                )
            )


    })


// Logout User  

const logoutUser = asyncHandler(async (req, res) => {
    //remove cookie
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res  
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))

})
// Logout User End here



//DECODE TOKEN KARNE K LIYE
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =  req.cookie.refreshToken || req.body.refreshToken
     
    if (incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

   try {
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id)
 
     if (!user) {
         throw new ApiError(401, "Invalid refresh token")
     }
 
     if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh token is expired or used")
 
     }
 
 
     const options = {
         httpOnly: true,
         secure: true
     }
 
     const {accessToken, newRefreshToken} =  await generateAccessAndRefreshTokens(user._id)
 
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
         new ApiResponse(
             200,
             {accessToken, refreshToken: newRefreshToken},
             "Access token refreshed"
         )
     )
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
    
   }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

}