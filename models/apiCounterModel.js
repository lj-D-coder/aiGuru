import mongoose from 'mongoose';


const hitCounterSchema = mongoose.Schema(
    {
    
        hitCounter: {
            type: Number,
            default: 1,
          }

    },
        {
            timestamps: false,
        },
    );

export const CounterModel = mongoose.model('hitCount', hitCounterSchema);

