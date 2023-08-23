import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../Models/UserModel.js"
import { generateToken , isAuth } from "../utils.js";

export const userRouter = express.Router();

userRouter.post("/signin", expressAsyncHandler(async (req, res) => {
    console.log("signin");
    const {email, password} = req.body
    console.log("email: " +email);
    const user =  await User.findOne({ email: email })
    console.log(user);
      
    if(user)
    {
        if(bcrypt.compareSync(password, user.password))
        {
            res.send({_id : user._id, username: user.username, email: user.email, token: generateToken(user)})
            console.log("signed in successfully");
            return;
        }
    }
    res.status(401).send({message: "Invalid Credentials"});
}));

userRouter.post("/signup", expressAsyncHandler(async (req, res) => {

    const {email , password} = req.body; //! validate email
    try{
        const newUser = new User({username: email.split('@')[0], email: email, password: bcrypt.hashSync(password,10)});
        const user = await newUser.save();
        res.send({_id: user._id, username: user.username, email: user.email, token: generateToken(user)});
    }
    catch(error){
        res.status(400).send({message: "email already in database"});
    }
}));

userRouter.get("/", isAuth , async (req,res) => {
    res.status(200).send({message: "Ok"})
});

