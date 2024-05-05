import { SubscriberModel } from "../models/subscribersModel.js";
import { Users } from "../models/usersModel.js";
import { errorHandler } from "../utils/error.js";

export const getToken = async (req, res, next) => {
    const { userId } = req.query;
  try {
    const validUser = await Users.findOne({ _id: userId });
    if (!validUser) return next(errorHandler(404, "User not found!"));
    const subscriber_info = await SubscriberModel.findOne({ stripeCusId: validUser.stripeCusId });
    res.status(200).json({
      success: true,
      userId: subscriber_info.userId,
      token: subscriber_info.subscription_info.token,
    });
  } catch (error) {
    next(error);
  }
};


export const tokenUpdate = async (req, res, next) => {
    const { userId, newTokenCount } = req.body;
    try {
      const validUser = await Users.findOne({ _id: userId });
      if (!validUser) return next(errorHandler(404, "User not found!"));
        var subscriber = await SubscriberModel.findOneAndUpdate(
            { stripeCusId: validUser.stripeCusId  },
            { $inc: { 'subscription_info.token': newTokenCount } },
            { new: true, upsert: true }
          );
        
      res.status(200).json({
        success: true,
        userId: subscriber.userId,
        token: subscriber.subscription_info.token,
      });
    } catch (error) {
      next(error);
    }
  };

