import mongoose from 'mongoose';

const usersGenDataSchema = mongoose.Schema(
    {
        userId: {
            type: String,
        },
        question:{
            type: String,
            require: true,
        },
        answers:{
            type: String,
        }

    },
        {
            timestamps: true,
        },
    );

export const UsersGenData = mongoose.model('questionAnswer', usersGenDataSchema);

