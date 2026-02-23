import jwt from 'jsonwebtoken';
import User from '../model/user.js';
export const loginuser = async (req, res) => {
    const { email, name, image, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, name, image, role });
            await user.save();
        }
        const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '15d' });
        res.status(200).json({
            message: 'Login successful in the controller',
            token,
            user,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error in the logincontroller' });
    }
};
const allowedroles = ['customer', 'rider', 'seller'];
export const addrole = async (req, res) => {
    const { role } = req.body;
    const email = req.user?.user?.email;
    try {
        if (!email) {
            return res.status(401).json({ error: 'User not authenticated in the addrole controller' });
        }
        if (!allowedroles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.role = role;
        await user.save();
        res.status(200).json({
            message: 'Role updated successfully',
            user,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
