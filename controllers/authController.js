import bcryptjs from "bcryptjs";
import { Users } from "../models/usersModel.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import stripePackage from "stripe";
import dotenv from "dotenv";
import { SubscriberModel } from "../models/subscribersModel.js";
import { TempUsers } from "../models/tempUserModel.js";
dotenv.config();

const stripe = stripePackage(process.env.STRIPE_KEY);

export const signup = async (req, res, next) => {
  try {
    const { email, password, verificationId, OTP } = req.body;

    if (!email || !password || !OTP || !verificationId) {
      return res.status(400).json({
        message: "send all required fields: email, password, verificationId, OTP",
      });
    }

    const checkUser = await Users.findOne({ email });
    if (checkUser) return next(errorHandler(400, "Email is already register!"));

    const verifyOTP = await TempUsers.findById(verificationId);

    if (!verifyOTP && verifyOTP.OTP !== OTP) {
      return next(errorHandler(400, "Invalid OTP entered !!!"));
    }

    const username = email.split("@")[0];
    //creating Stripe Customer Id
    const customer = await stripe.customers.create({
      name: username,
      email: email,
    });
    if (!customer) return next(errorHandler(404, "Something Went wrong Please Try again later"));
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
      stripeCusId: customer.id,
    });
    const user = await newUser.save();
    const JWT_token = jwt.sign({ userId: user._id, email: email }, process.env.JWT_SECRET);

    const subcriptionData = {
      userId: user._id,
      stripeCusId: customer.id,
      session_id: "0",
      subscription_info: {
        id: "0",
        status: "Free",
        token: 3000,
        interval: "0",
        expiryAt: "0",
      },
    };
    const sub_info = await SubscriberModel.updateOne({ stripeCusId: customer.id }, subcriptionData, { upsert: true });
    if (!sub_info) return next(errorHandler(404, "error in adding subscription info"));
    console.log("User Sign Up using Password and Email successfully");
    const clearTemp = await TempUsers.deleteById(verificationId);
    return res.status(201).json({ success: true, JWT_token });
  } catch (error) {
    console.log(error.message);
    // error.keyValue["message"] = "already exist";
    //res.status(200).json(error);
    next(errorHandler(400, "something went wrong"));
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await Users.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found!"));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!"));
    const JWT_token = jwt.sign({ userId: validUser._id, email: validUser.email }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    console.log("User Sign in using Password and Email successfully");
    res.status(200).json({ success: true, JWT_token });
    //.cookie("access_token", token, { httponly: true , maxAge: 24 * 60 * 60 * 1000 })
  } catch (error) {
    next(error);
  }
};

export const saveGoogleinfo = async (req, res, next) => {
  if (!req.body.email || !req.body.gToken || !req.body.expiry) {
    return response.status(400).json({
      message: "send all required fields: email, gToken, expiry",
    });
  }

  const { email, gToken, expiry } = req.body;
  try {
    const checkEmail = await Users.findOne({ email });
    const username = email.split("@")[0];
    if (!checkEmail) {
      const customer = await stripe.customers.create({
        name: username,
        email: email,
      });

      if (!customer) return next(errorHandler(404, "Somthing Went wrong Please Try agian later"));

      const saveUserInfo = new Users({
        username,
        email,
        gAuthToken: gToken,
        stripeCusId: customer.id,
        expiry,
      });
      const userInfo = await saveUserInfo.save();

      const JWT_token = jwt.sign({ userId: userInfo._id, email: userInfo.email }, process.env.JWT_SECRET);
      console.log("New Google Sign in sucessfully");

      const subcriptionData = {
        userId: userInfo._id,
        stripeCusId: customer.id,
        session_id: "0",
        subscription_info: {
          id: "0",
          status: "Free",
          token: 3000,
          interval: "0",
          expiryAt: "0",
        },
      };
      const subscriber = await SubscriberModel.updateOne({ stripeCusId: userInfo.stripeCusId }, subcriptionData, {
        upsert: true,
      });
      if (!subscriber) return next(errorHandler(400, "Error in Adding subscriber info"));
      res.status(200).json({ success: true, JWT_token });
    } else {
      const updatedData = {
        gAuthToken: req.body.gToken,
        expiry: req.body.expiry,
      };
      await Users.updateOne({ email }, updatedData, { upsert: true });
      const JWT_token = jwt.sign({ userId: checkEmail._id, email: checkEmail.email }, process.env.JWT_SECRET);
      console.log("Google sign In Token Updated");
      res.status(200).json({ success: true, JWT_token });
    }
  } catch (error) {
    //next(errorHandler(500, 'something went wrong!'));
    console.log(error.message);
  }
};
