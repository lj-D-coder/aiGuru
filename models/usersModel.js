import mongoose from 'mongoose';

const usersSchema = mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
        },
        email:{
            type: String,
            require: true,
            unique: true,
        },
        password:{
            type: String,
        },

        gAuthToken:{
            type: String
        },
        expiry: {
            type: String
        }

    },
        {
            timestamps: true,
        },
    );

export const Users = mongoose.model('users_collection', usersSchema);

