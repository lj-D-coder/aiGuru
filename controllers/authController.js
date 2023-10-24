import bcryptjs from "bcryptjs";
import { Users } from '../models/usersModel.js';
//import { errorHandler } from "../utils/error.js";

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