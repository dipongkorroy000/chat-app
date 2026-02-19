import mongoose, {Schema, Types} from "mongoose";
import {IMessage} from "../types";

const schema = new Schema<IMessage>(
  {
    chatId: {type: Schema.Types.ObjectId, ref: "Chat", required: true},
    sender: {type: String, required: true},
    text: String,
    image: {url: String, publicId: String},
    messageType: {type: String, enum: ["text", "image"], default: "text"},
    seen: {type: Boolean, default: false},
    seenAt: {type: Date, default: null},
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Messages = mongoose.model<IMessage>("Messages", schema);
