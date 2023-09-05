import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../Models/UserModel.js";
import { generateToken, isAuth } from "../utils.js";

export const userRouter = express.Router();

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    console.log("signin");
    const { email, password } = req.body;
    console.log("email: " + email);
    const user = await User.findOne({ email: email });
    console.log(user);

    if (user) {
      await user.populate("myFavouriteList");
      if (bcrypt.compareSync(password, user.password)) {
        res.send({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user),
          userList: user.myFavouriteList
        });
        console.log("signed in successfully");
        return;
      }
    }
    res.status(401).send({ message: "Invalid Credentials" });
  })
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body; //! validate email
    try {
      const newUser = new User({
        username: email.split("@")[0],
        email: email,
        password: bcrypt.hashSync(password, 10),
      });
      const user = await newUser.save();
      res.send({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user),
      });
    } catch (error) {
      res.status(400).send({ message: "email already in database" });
    }
  })
);

userRouter.get(
  "/list",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const id = req.user._id;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).send({ message: "user not found" });
      return;
    }
    if (!user.myFavouriteList) {
      return [];
    }
    await user.populate("myFavouriteList");
    res.status(200).send(user.myFavouriteList);
  })
);

userRouter.post(
  "/list",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const id = req.user._id
    const { content } = req.body;
    console.log(`id${id}`);
    console.log(`content${content}`);

    const user = await User.findById(id);
    console.log(user);
    let newList = user.myFavouriteList ? [...user.myFavouriteList] : [];
    const indexCon = user.myFavouriteList.indexOf(content);
    if (indexCon === -1) {
      newList.push(content);
    } else {
      newList.splice(indexCon, 1);
    }
    user.myFavouriteList = newList;
    await user.save();
    await user.populate("myFavouriteList");
    return res.status(200).send(content);
  })
);
