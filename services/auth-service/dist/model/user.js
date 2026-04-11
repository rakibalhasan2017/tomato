import mongoose, { Schema } from 'mongoose';
const UserLocationSchema = new Schema({
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
                validator: (coordinates) => coordinates.length === 2,
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
}, { _id: false });
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: false },
    role: { type: String, default: null },
    currentLocation: { type: UserLocationSchema, required: false },
}, {
    timestamps: true,
});
UserSchema.index({ 'currentLocation.point': '2dsphere' });
const User = mongoose.model('User', UserSchema);
export default User;
