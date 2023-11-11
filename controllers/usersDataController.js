import { Feedback } from '../models/feedbackModel.js';
import {UsersGenData} from '../models/usersGeneratedData.js';
import { Users } from '../models/usersModel.js';
import { errorHandler } from "../utils/error.js";


export const ques_ans = async (req, res, next) => {
    const { userId } = req.body;
    console.log(req.body);
    try {
        const validUser = await Users.findOne({ _id: userId });
        
        if (!validUser) return next(errorHandler(404, 'User not found!'));
        const userData = await UsersGenData.find({userId: validUser._id}).sort({ createdAt: -1 });
        console.log(validUser);
        res.status(200).json({ success: true, userData });
    } catch (error) {
        next(error);
    }
};



export const feedback = async (req, res, next) => {
    const { userId, feedback } = req.body;
    try {
        if( !userId || userId.trim() === '' ||
            !feedback || feedback.trim() === ''
        ) 
        {
            return res.status(400).json(
                {
                    message: "send all required feilds: userId, feedback",
                });
        }
        
        const validUser = await Users.findOne({ _id: userId });
        if (!validUser) return next(errorHandler(404, 'User not found!'));
        const newFeedback = new Feedback({ userId, email : validUser.email, feedback  });
        const saveFeed = await newFeedback.save();   
        console.log(saveFeed);
        return res.status(201).json({ success:true, saveFeed });  
        
    } catch (error) {
        res.status(200).json(error);
    }

};