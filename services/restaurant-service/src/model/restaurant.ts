import mongoose, { Document, Schema } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  description?: string;
  image: string;
  owenerID: mongoose.Types.ObjectId;
  phonenumber: string;
  isverified: boolean;
  isopen: boolean;
  createdAt: Date;
  autolocation: {
    type: 'Point';
    coordinates: [number, number];
    formattedAddress: string;
  };
}

const RestaurantSchema: Schema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    image: { type: String, required: true },
    owenerID: {
      type: Schema.Types.ObjectId, // ✅ FIXED (was String)
      required: true,
      ref: 'User', // optional but recommended
    },
    phonenumber: { type: String, required: true },
    isverified: { type: Boolean, default: false },
    isopen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    autolocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coordinates: number[]) => coordinates.length === 2,
          message: 'Coordinates must contain [longitude, latitude]',
        },
      },
      formattedAddress: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);
RestaurantSchema.index({ autolocation: '2dsphere' });
export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
