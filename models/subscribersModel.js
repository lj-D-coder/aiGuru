import mongoose from 'mongoose';

const subscriber = mongoose.Schema(
    {
        userId: {
            type: String,
            require: true,
            unique: true,
        },
        stripeCusId: {
            type: String,
            require: true,
            unique: true,
        },
        session_id: {
            type: String,
        },
        subscription_info: {
            id: {
                type: String,
            },
            status: {
                type: String,
            },
            token: {
                type: Number,
                default: 3000,
            },
            interval: {
                type: String,
            },
            expiryAt: {
                type: String,
            }
        }    
    },
        {
            timestamps: true,
        },
    );

export const SubscriberModel = mongoose.model('subscribers_info', subscriber);

