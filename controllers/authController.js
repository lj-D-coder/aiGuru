import bcryptjs from "bcryptjs";
import { Users } from '../models/usersModel.js';
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
    //console.log(req.body);
    try {
        if(
            !req.body.username || 
            !req.body.email || 
            !req.body.password
        ) {
            return response.status(400).json(
                {
                    message: "send all required feilds: username, email, password",
                });
        }

        const { username, email, password } = req.body;
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new Users({ username, email, password: hashedPassword });
        const user = await newUser.save();
        console.log(user);
        
        return res.status(201).json({
            data: { userId: user.id, email:user.email, userName: user.username },
            statusCode: 201, error: "successfully created"
        });
        
    } catch (error) {
        // console.log(error.message);
        // error.keyValue["message"] = "already exist";
        res.status(500).json(error);
        //next(errorHandler(400,"bad request"));
    }

};
 

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const validUser = await Users.findOne({ email });
        if (!validUser) return next(errorHandler(404, 'User not found!'));
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));
        const JWT_token = jwt.sign({ userId: validUser._id, email: validUser.email }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = validUser._doc;
        const userData = { Question: "This is a question ", Answer: "This is a sample answer " };
        res.status(200).json({ success: true, JWT_token, userData });
        //.cookie("access_token", token, { httponly: true , maxAge: 24 * 60 * 60 * 1000 })        
    } catch (error) {
        next(error);
    }
};

export const saveGoogleinfo = async (req, res, next) => {


    if(
        !req.body.email || 
        !req.body.gToken || 
        !req.body.expiry
    ) {
        return response.status(400).json(
            {
                message: "send all required feilds: email, gToken, expiry",
            });
    }
    // console.log(req.body);
    // 
    // const checkEmail = await Users.findOne({ email });
    // const username = email.split('@')[0];

    // console.log(username)

    const { email, gToken, expiry } = req.body;
    try {
        const checkEmail = await Users.findOne({ email });
        const username = email.split('@')[0];
        //console.log(username);
        if (!checkEmail) {
            const saveUserInfo = new Users({ username, email, gAuthToken: gToken, expiry });
            const userInfo = await saveUserInfo.save();
            console.log(userInfo);
            const JWT_token = jwt.sign({ userId: saveUserInfo._id, email: saveUserInfo.email }, process.env.JWT_SECRET);
            const userData = { Question: "This is a question ", Answer: "This is a sample answer " };
            res.status(200).json({ success: true, JWT_token, userData });  
        }
        else {

            const updatedData = {gAuthToken: req.body.gToken,expiry: req.body.expiry };
    
            const userInfo = await Users.updateOne({ email }, updatedData,
                { upsert: true }
            );
            const JWT_token = jwt.sign({ userId: checkEmail._id, email: checkEmail.email }, process.env.JWT_SECRET);
            const userData = { Question: "This is a question ", Answer: "This is a sample answer " };
            res.status(200).json({ success: true, JWT_token, userData });
        }
        
        
    } catch (error) {
        //next(errorHandler(500, 'something went wrong!'));
        console.log(error.message);
    }
};