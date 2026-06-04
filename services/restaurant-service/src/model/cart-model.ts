import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  userID: mongoose.Types.ObjectId;
  restaurantID: mongoose.Types.ObjectId;
  items: {
    menuItemID: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema: Schema = new Schema<ICart>(
  {
    userID: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    restaurantID: { type: Schema.Types.ObjectId, required: true, ref: 'Restaurant' },
    items: [
      {
        menuItemID: { type: Schema.Types.ObjectId, required: true, ref: 'MenuItem' },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', CartSchema);
