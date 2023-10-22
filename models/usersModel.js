import mongoose from 'mongoose';

const usersSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        email:{
            type: String,
            require: true,
        },
        phoneNo:{
            type: Number,
            require: true,
        },
    },
        {
            timestamps: true,
        },
    );

export const Users = mongoose.model('users_collection', usersSchema);
