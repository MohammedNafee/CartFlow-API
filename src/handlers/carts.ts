import express , { Request, Response } from 'express';
import { CartStore } from '../models/cart';
import { authorize as requireAuth } from '../services/auth';
import dotenv from 'dotenv';

dotenv.config();

const cartRoutes = express.Router();
const store = new CartStore();

export const getActiveCart = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const cart = await store.getActiveCartByUser(userId);
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createCart = async (req: Request, res: Response) => {
    try {
        const newCart = await store.createCart(req.body);
        res.status(201).json(newCart);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const completeCart = async (req: Request, res: Response) => {
    try {
        const cartId = req.params.id as string;
        const completedCart = await store.completeCart(cartId);
        res.json(completedCart);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

cartRoutes.post('/api/carts', createCart);
cartRoutes.get('/api/carts/active/:userId', getActiveCart);
cartRoutes.put('/api/carts/:id/complete', completeCart);
export default cartRoutes;
