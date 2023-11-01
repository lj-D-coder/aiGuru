import mongoose from 'mongoose';

const feedbackSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            require: true,
        },
        email:{
            type: String,
            require: true,
        },
        feedback:{
            type: String,
            require: true,
        },
    },
        {
            timestamps: true,
        },
    );

export const Feedback = mongoose.model('feedback_collection', feedbackSchema);
