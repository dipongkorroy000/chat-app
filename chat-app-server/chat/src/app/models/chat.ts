import mongoose, {Schema} from "mongoose";
import {IChat} from "../types";

const schema: Schema<IChat> = new Schema(
  {
    users: [{type: String, require: true}],
    latestMessage: {text: String, sender: String},
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Chat = mongoose.model<IChat>("Chat", schema);
