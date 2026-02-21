import {ObjectId, Types} from "mongoose";
import {publishToQueue} from "../config/rabbitmq";
import {redisClient} from "../config/redis";
import {AuthenticatedRequest} from "../middleware/isAuth";
import {User} from "../model/user.model";
import {IUser} from "../types";
import catchAsync from "../utils/catchAsync";
import {generateToken} from "../utils/jwtHelper";
import {JwtPayload} from "jsonwebtoken";

export const loginUser = catchAsync(async (req, res) => {
  const {email} = req.body;

  const rateLimitKey = `OTP: ratelimit: ${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    res.send(429).json({success: false, message: "Too may requests. Please wait before requesting new OTP"});
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, otp, {EX: 300});

  await redisClient.set(rateLimitKey, "true", {EX: 60});

  const message = {
    to: email,
    subject: "Your OTP code",
    body: `Your OTP is ${otp}. It is valid for 5 minutes`,
  };

  await publishToQueue("send-otp", message);

  res.status(200).json({success: true, message: "OTP sent to your mail"});
});

export const verifyUser = catchAsync(async (req, res) => {
  const {email, otp: enteredOTP} = req.body;

  if (!email || !enteredOTP) {
    res.status(400).send({success: false, message: "Email and OTP Required"});
    return;
  }

  const otpKey = `otp:${email}`;

  const storedOTP = await redisClient.get(otpKey);

  if (!storedOTP || storedOTP != enteredOTP) {
    res.status(400).send({success: false, message: "Invalid or expired OTP"});
    return;
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({email});
  if (!user) {
    const name = email.match(/^([a-zA-Z]+)(?=[0-9]*@)/)?.[1] || "User";
    try {
      user = await User.create({name, email});
    } catch (error: any) {
      if (error.code === 11000) {
        user = await User.findOne({email});
      } else {
        throw error;
      }
    }
  }

  const token = generateToken(user?._id as Types.ObjectId);

  res.json({success: true, message: "User Verified", user, token});
});

export const getUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.json({success: true, message: "Users retrieved successfully", users});
});

export const myProfile = catchAsync(async (req: AuthenticatedRequest, res) => {
  const {_id} = req.token as JwtPayload;
  const user = await User.findById(_id);

  res.status(200).json({success: true, message: "Profile retrieved successfully", user});
});

export const updateProfile = catchAsync(async (req: AuthenticatedRequest, res) => {
  const {_id} = req.token as JwtPayload;
  const {name, bio, about} = req.body;

  const updateData: Partial<Pick<IUser, "name" | "bio" | "about">> = {};

  if (name !== undefined) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (about !== undefined) updateData.about = about;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({success: false, message: "No fields sent to update (name, bio, about)"});
  }

  const updatedUser = await User.findByIdAndUpdate(_id, {$set: updateData}, {new: true, runValidators: true});

  if (!updatedUser) return res.status(404).json({success: false, message: "User not found"});

  return res.status(200).json({
    success: true,
    message: "Update successfully",
    user: {
      name: updatedUser.name,
      bio: updatedUser.bio,
      about: updatedUser.about,
    },
  });
});

export const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({success: true, message: "User retrieved successfully", user});
});
