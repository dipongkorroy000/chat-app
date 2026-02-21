import {JwtPayload} from "jsonwebtoken";
import {AuthenticatedRequest} from "../middleware/isAuth";
import catchAsync from "../utils/catchAsync";
import {Chat} from "../models/chat";
import {Messages} from "../models/messages";
import axios from "axios";
import env from "../env";

export const createNewChat = catchAsync(async (req: AuthenticatedRequest, res) => {
  const {_id} = req.token as JwtPayload;

  const {otherUserId} = req.body;

  if (!otherUserId) return res.status(400).json({success: false, message: "Other userid id is required"});

  const existingChat = await Chat.findOne({users: {$all: [_id, otherUserId], $size: 2}});

  if (existingChat) return res.status(200).json({success: true, message: "Chat Already exits", chatId: existingChat._id});

  const newChat = await Chat.create({users: [_id, otherUserId]});

  res.status(201).json({success: true, message: "New Chat created", chatId: newChat._id});
});

export const getUserChats = catchAsync(async (req: AuthenticatedRequest, res) => {
  const {_id} = req.token as JwtPayload;

  if (!_id) return res.status(400).json({success: false, message: "User id missing"});

  const chats = await Chat.find({users: _id}).sort({updatedAt: -1});

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== _id);

      const unseenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: {$ne: _id},
        seen: false,
      });

      try {
        const {data} = await axios.get(`${env.user_service_url}/user/${otherUserId}`);

        return {
          user: data,
          chat: {...chat.toObject(), latestMessage: chat.latestMessage || null, unseenCount},
        };
      } catch (error) {
        console.log(error);
        return {
          user: {_id: otherUserId, name: "Unknown User"},
          chat: {...chat.toObject(), latestMessage: chat.latestMessage || null, unseenCount},
        };
      }
    })
  );

  res.json({success: true, message: "Chats retrieved successfully", chats: chatWithUserData});
});

export const sendMessage = catchAsync(async (req: AuthenticatedRequest, res) => {
  const {_id: senderId} = req.token as JwtPayload;
  const {chatId, text} = req.body;

  const imageFile = req.file;

  if (!senderId || !chatId) return res.status(401).json({success: false, message: "unauthorized"});
  if (!text && !imageFile) return res.status(400).json({success: false, message: "Either text or images is required"});

  const chat = await Chat.findById(chatId);

  if (!chat) return res.status(404).json({success: false, message: "chat not found"});

  const isUserInChat = chat.users.some((userId) => userId.toString() === senderId.toString());

  if (!isUserInChat) return res.status(403).json({success: false, message: "You are not a participant of this chat"});

  const otherUserId = chat.users.find((userId) => userId.toString() !== senderId);

  if (!otherUserId) return res.status(401).json({success: false, message: "No other user"});

  // socket setup

  let messageData: any = {
    chatId,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  };

  if (imageFile) {
    messageData.image = {url: imageFile.path, publicId: imageFile.fieldname};
    messageData.messageType = "image";
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }

  const message = new Messages(messageData);

  const savedMessage = await message.save();

  const latestMessageText = imageFile ? "Image" : text;

  await Chat.findByIdAndUpdate(chatId, {latestMessage: {text: latestMessageText, sender: senderId}, updatedAt: new Date()}, {new: true});

  // emit to sockets

  res.status(201).json({success: true, messages: savedMessage, sender: senderId});
});

export const getMessagesByChat = catchAsync(async (req: AuthenticatedRequest, res) => {
  const {_id: userId} = req.token as JwtPayload;
  const {chatId} = req.params;

  if (!userId || !chatId) return res.status(401).json({success: false, message: "unauthorized"});

  const chat = await Chat.findById(chatId);

  if (!chat) return res.status(404).json({success: false, message: "chat not found"});

  const isUserInChat = chat.users.some((userId) => userId.toString() === userId.toString());

  if (!isUserInChat) return res.status(403).json({success: false, message: "You are not a participant of this chat"});

  const messagesToMarkSeen = await Messages.find({chatId, sender: {$ne: userId}, seen: false});

  await Messages.updateMany({chatId, sender: {$ne: userId}, seen: false}, {seen: true, seenAt: new Date()});

  const messages = await Messages.find({chatId}).sort({createdAt: 1});

  const otherUserId = chat.users.find((id) => id !== userId);

  try {
    const {data} = await axios.get(`${env.user_service_url}/user/${otherUserId}`);

    if (!otherUserId) return res.status(403).json({success: false, message: "No other user"});

    // socket work

    res.json({success: true, messages: messages, user: data});
  } catch (error) {
    console.log(error);
    res.json({
      messages: messages,
      user: {_id: otherUserId, name: "Unknown User"},
    });
  }
});
