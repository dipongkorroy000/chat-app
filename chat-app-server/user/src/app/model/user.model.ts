import mongoose, {Schema} from "mongoose";
import {IUser} from "../types";

const schema: Schema<IUser> = new Schema(
  {
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    about: {type: String, require: false},
    bio: {type: String, required: false},
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = mongoose.model<IUser>("User", schema);
