import mongoose, { Document, Schema } from 'mongoose';
export interface IMenuItem extends Document {
    name: string;
    description: string;
    price: number;
    image: string;
    isavailable: boolean;
    restaurantID: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MenuItemSchema: Schema = new Schema<IMenuItem>(
    {
        name: { type: String, required: true },
        description: { type: String, required: false },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        isavailable: { type: Boolean, default: false },
        restaurantID: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Restaurant',
        },
    },
    { timestamps: true }
)

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
