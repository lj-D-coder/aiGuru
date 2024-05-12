import mongoose from 'mongoose';

const tempUsersSchema = mongoose.Schema(
    {
        email:{
            type: String,
            require: true,
        },
        OTP: {
            type: String
        },
    },
        {
            timestamps: true,
        },
    );

export const TempUsers = mongoose.model('temp_users', tempUsersSchema);