import express, { Request, Response } from 'express';
import { ItemStore } from '../models/item';
import { authorize as requireAuth } from '../services/auth';
import dotenv from 'dotenv';

dotenv.config();

const itemRoutes = express.Router();
const store = new ItemStore();

export const addItemToCart = async (req: Request, res: Response) => {
    try {
        const newItem = await store.addItemToCart(req.body);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const removeItemFromCart = async (req: Request, res: Response) => {
    try {
        const itemId = req.params.id as string;
        const removedItem = await store.removeItemFromCart(itemId);
        res.status(200).json(removedItem);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getItemsByCartId = async (req: Request, res: Response) => {
    try {
        const cartId = req.params.cartId as string;
        const items = await store.getItemsByCartId(cartId);
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getItem = async (req: Request, res: Response) => {
    try {
        const itemId = req.params.id as string;
        const item = await store.getItemById(itemId);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

itemRoutes.post('/api/items', addItemToCart);
itemRoutes.delete('/api/items/:id', removeItemFromCart);
itemRoutes.get('/api/items/:id', getItem);
itemRoutes.get('/api/carts/:cartId/items', getItemsByCartId);
export default itemRoutes;
