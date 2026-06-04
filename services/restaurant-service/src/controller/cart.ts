import { Request, Response } from 'express';
import Cart from '../model/cart-model.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { restaurantID, menuItemID, quantity } = req.body;

    if (!restaurantID || !menuItemID || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cartofdifferentrestaurant = await Cart.findOne({
      userID: user.id,
      restaurantID: { $ne: restaurantID },
    });

    if (cartofdifferentrestaurant) {
      return res
        .status(400)
        .json({
          error:
            'You have items from a different restaurant in your cart. Please clear your cart before adding items from another restaurant.',
        });
    }

    let cart = await Cart.findOne({ userID: user.id, restaurantID });

    if (!cart) {
      cart = new Cart({
        userID: user.id,
        restaurantID,
        items: [{ menuItemID, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex((item) => item.menuItemID.toString() === menuItemID);

      if (itemIndex > -1) {
        const item = cart.items[itemIndex];
        if (item) {
          item.quantity += quantity;
        }
      } else {
        cart.items.push({ menuItemID, quantity });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cart = await Cart.findOne({ userID: user.id }).populate('items.menuItemID');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cart = await Cart.findOneAndDelete({ userID: user.id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { menuItemID } = req.body;

    if (!menuItemID) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cart = await Cart.findOne({ userID: user.id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.menuItemID.toString() !== menuItemID);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCartItemQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { menuItemID, quantity } = req.body;

    if (!menuItemID || quantity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cart = await Cart.findOne({ userID: user.id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.menuItemID.toString() === menuItemID);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
      if (cart.items.length === 0) {
        await Cart.findOneAndDelete({ userID: user.id });
        return res.status(200).json({ items: [], restaurantID: null });
      }
    } else {
      const item = cart.items[itemIndex];
      if (item) item.quantity = quantity;
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
