import express, {Router} from "express";
import {getUser, getUsers, loginUser, myProfile, updateProfile, verifyUser} from "../controller/user";
import {isAuth} from "../middleware/isAuth";

const router: Router = express.Router();

router.post("/login", loginUser);

router.post("/verify-user", verifyUser);

router.get("/get-users", getUsers);

router.get("/user/:id", getUser);

router.get("/my-profile", isAuth, myProfile);

router.patch("/update-profile", isAuth, updateProfile);

export default router;
