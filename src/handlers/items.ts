/**
 * @swagger
 * tags:
 *   - name: Items
 *     description: Cart items management
 */

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Add an item to a cart
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cart_id
 *               - product_id
 *               - quantity
 *               - price
 *             properties:
 *               cart_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       '201':
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 cart_id:
 *                   type: string
 *                 product_id:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 price:
 *                   type: number
 */

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get an item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Item object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 cart_id:
 *                   type: string
 *                 product_id:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 price:
 *                   type: number
 *       '404':
 *         description: Item not found
 */

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Remove an item from a cart (decrement or delete)
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Item removed (or quantity decremented)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 cart_id:
 *                   type: string
 *                 product_id:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 price:
 *                   type: number
 */

/**
 * @swagger
 * /api/carts/{cartId}/items:
 *   get:
 *     summary: Get items for a given cart
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Array of items in the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   cart_id:
 *                     type: string
 *                   product_id:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   price:
 *                     type: number
 */

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
