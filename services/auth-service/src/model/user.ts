import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  image: string;
  role: string;
}

const UserSchema: Schema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: false },
    role: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUserDocument>('User', UserSchema);

export default User;
