import {Types} from "mongoose";

export interface IChat extends Document {
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  sender: string;
  text?: string;
  image?: {url: string; publicId: string};
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
