import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import {
  uploadOnCloudinary,
  deleteOnCloudinary,
  extractPublicIdFromCloudinaryUrl,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { createDefaultAvatar } from "../utils/defaultAvatar.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if ([fullName, username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!USERNAME_REGEX.test(username.trim())) {
    throw new ApiError(400, "Username must be 3-30 characters and contain only letters, numbers, and underscores");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const normalizedFullName = fullName.trim();
  const normalizedUsername = username.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  const existedUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User already exists with the provided email or username"
    );
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  let avatarUrl = createDefaultAvatar({
    fullName: normalizedFullName,
    username: normalizedUsername,
  });

  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath, {
      resourceType: "image",
    });
    const avatarImageUrl = avatar?.secure_url || avatar?.url;

    if (!avatarImageUrl) {
      throw new ApiError(500, "Error while uploading avatar image");
    }

    avatarUrl = avatarImageUrl;
  }

  let coverImageUrl = "";

  if (coverImageLocalPath) {
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, {
      resourceType: "image",
    });
    const coverImageAssetUrl = coverImage?.secure_url || coverImage?.url;

    if (!coverImageAssetUrl) {
      throw new ApiError(500, "Error while uploading cover image");
    }

    coverImageUrl = coverImageAssetUrl;
  }

  const user = await User.create({
    fullName: normalizedFullName,
    avatar: avatarUrl,
    coverImage: coverImageUrl,
    username: normalizedUsername,
    email: normalizedEmail,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required for login");
  }

  if (!password?.trim()) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [
      email ? { email: email.toLowerCase() } : null,
      username ? { username: username.toLowerCase() } : null,
    ].filter(Boolean),
  });

  if (!user) {
    throw new ApiError(
      404,
      "User not found with the provided email or username"
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = getCookieOptions();

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  const options = getCookieOptions();

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = getCookieOptions();

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword?.trim() || !newPassword?.trim()) {
    throw new ApiError(400, "Old password and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, email } = req.body;

  if ([fullName, username, email].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!USERNAME_REGEX.test(username.trim())) {
    throw new ApiError(400, "Username must be 3-30 characters and contain only letters, numbers, and underscores");
  }

  const normalizedFullName = fullName.trim();
  const normalizedUsername = username.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    _id: { $ne: req.user?._id },
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "Another user already exists with the provided email or username"
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: normalizedFullName,
        username: normalizedUsername,
        email: normalizedEmail,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath, {
    resourceType: "image",
  });
  const avatarUrl = avatar?.secure_url || avatar?.url;

  if (!avatarUrl) {
    throw new ApiError(500, "Error while uploading avatar image");
  }

  const currentUser = await User.findById(req.user?._id).select("avatar");

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUrl,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  const oldAvatarPublicId = extractPublicIdFromCloudinaryUrl(currentUser.avatar);

  if (currentUser.avatar && currentUser.avatar !== avatarUrl && oldAvatarPublicId) {
    await deleteOnCloudinary(oldAvatarPublicId).catch(() => {});
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath, {
    resourceType: "image",
  });
  const coverImageUrl = coverImage?.secure_url || coverImage?.url;

  if (!coverImageUrl) {
    throw new ApiError(500, "Error while uploading cover image");
  }

  const currentUser = await User.findById(req.user?._id).select("coverImage");

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImageUrl,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  const oldCoverImagePublicId = extractPublicIdFromCloudinaryUrl(
    currentUser.coverImage
  );

  if (currentUser.coverImage && currentUser.coverImage !== coverImageUrl && oldCoverImagePublicId) {
    await deleteOnCloudinary(oldCoverImagePublicId).catch(() => {});
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const viewerObjectId = mongoose.isValidObjectId(req.user?._id)
    ? new mongoose.Types.ObjectId(req.user._id)
    : null;

  if (!username?.trim()) {
    throw new ApiError(404, "User not found with the provided username");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: viewerObjectId
          ? {
              $in: [viewerObjectId, "$subscribers.subscriber"],
            }
          : false,
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(404, "Channel not found for the provided username");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel[0],
        "User channel profile fetched successfully"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const currentUserId = new mongoose.Types.ObjectId(req.user?._id);
  const currentUser = await User.findById(req.user?._id).select("watchHistory");
  const historyIds = currentUser?.watchHistory || [];

  if (!historyIds.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Watch history fetched successfully"));
  }

  const videos = await Video.aggregate([
    {
      $match: {
        _id: {
          $in: historyIds,
        },
        $or: [{ isPublished: true }, { owner: currentUserId }],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  const historyOrder = new Map(
    historyIds.map((videoId, index) => [videoId.toString(), index])
  );

  videos.sort(
    (left, right) =>
      (historyOrder.get(left._id.toString()) ?? Number.MAX_SAFE_INTEGER) -
      (historyOrder.get(right._id.toString()) ?? Number.MAX_SAFE_INTEGER)
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Watch history fetched successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
