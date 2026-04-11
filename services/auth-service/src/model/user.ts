import mongoose, { Document, Schema } from 'mongoose';

export interface IUserLocation {
  point?: {
    type: 'Point';
    coordinates: [number, number];
  };
  accuracyMeters?: number;
  capturedAt: Date;
  source: 'browser';
  permission: 'granted' | 'denied' | 'unavailable';
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  image: string;
  role: string;
  currentLocation?: IUserLocation;
}

const UserLocationSchema = new Schema<IUserLocation>(
  {
    point: {
      type: {
        type: String,
        enum: ['Point'],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
        validate: {
          validator: (coordinates: number[]) => coordinates.length === 2,
          message: 'Coordinates must contain [longitude, latitude]',
        },
      },
    },
    accuracyMeters: { type: Number, min: 0 },
    capturedAt: { type: Date, required: true },
    source: { type: String, enum: ['browser'], required: true },
    permission: {
      type: String,
      enum: ['granted', 'denied', 'unavailable'],
      required: true,
    },
  },
  { _id: false },
);

const UserSchema: Schema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: false },
    role: { type: String, default: null },
    currentLocation: { type: UserLocationSchema, required: false },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ 'currentLocation.point': '2dsphere' });

const User = mongoose.model<IUserDocument>('User', UserSchema);

export default User;
