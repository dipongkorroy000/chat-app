import express, {Router} from "express";
import {isAuth} from "../middleware/isAuth";
import {createNewChat, getMessagesByChat, getUserChats, sendMessage} from "../controllers/chat";
import {upload} from "../middleware/multer";

const router: Router = express.Router();

router.post("/chat/new", isAuth, createNewChat);

router.get("/chat/all", isAuth, getUserChats);

router.post("/message", isAuth, upload.single("image"), sendMessage);

router.get("/message/:chatId", isAuth, getMessagesByChat);

export default router;
