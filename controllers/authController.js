import bcryptjs from "bcryptjs";
import { Users } from '../models/usersModel.js';
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import stripePackage from 'stripe';
import dotenv from "dotenv";
dotenv.config();

const stripe = stripePackage(process.env.STRIPE_KEY);

export const signup = async (req, res) => {
    try {
        if(
            !req.body.email || 
            !req.body.password
        ) {
            return res.status(400).json(
                {
                    message: "send all required feilds: email, password",
                });
        }

        const { email, password } = req.body;
        const username = email.split('@')[0];
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new Users({ username, email, password: hashedPassword, stripeCusId: 0 });
        let user = await newUser.save();
        const JWT_token = jwt.sign({ userId: user._id, email: email }, process.env.JWT_SECRET);
        console.log(user);

        //creating Stripe Customer Id
        const customer = await stripe.customers.create({
        name: username,
        email: email,
        });

        user.stripeCusId = customer.id;
        user = await user.save();
        
        return res.status(201).json({ success:true,JWT_token });
    } catch (error) {
        // console.log(error.message);
       // error.keyValue["message"] = "already exist";
        res.status(200).json(error);
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
        res.status(200).json({ success: true, JWT_token });
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

    const { email, gToken, expiry } = req.body;
    try {
        const checkEmail = await Users.findOne({ email });
        const username = email.split('@')[0];
        if (!checkEmail) {
            const saveUserInfo = new Users({ username, email, gAuthToken: gToken, expiry });
            let userInfo = await saveUserInfo.save();
            console.log(userInfo);
            const JWT_token = jwt.sign({ userId: saveUserInfo._id, email: saveUserInfo.email }, process.env.JWT_SECRET);

            const customer = await stripe.customers.create({
                name: username,
                email: email,
                });
        
                saveUserInfo.stripeCusId = customer.id;
                saveUserInfo = await user.save();
                
            res.status(200).json({ success: true, JWT_token });  
        }
        else {
            const customer = await stripe.customers.create({
                name: username,
                email: email,
            });
            
            const updatedData = { gAuthToken: req.body.gToken,stripeCusId : customer.id, expiry: req.body.expiry };
    
            const userInfo = await Users.updateOne({ email }, updatedData,
                { upsert: true }
            );
            const JWT_token = jwt.sign({ userId: checkEmail._id, email: checkEmail.email }, process.env.JWT_SECRET);
            console.log(userInfo);
            res.status(200).json({ success: true, JWT_token });
        }
        
        
    } catch (error) {
        //next(errorHandler(500, 'something went wrong!'));
        console.log(error.message);
    }
};