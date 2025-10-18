/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product catalog
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags: [Products]
 *     responses:
 *       '200':
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   description:
 *                     type: string
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A product object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 description:
 *                   type: string
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 description:
 *                   type: string
 */

import express, { Request, Response } from 'express';
import { ProductStore } from '../models/product';
import { authorize as requireAuth } from '../services/auth';
import dotenv from 'dotenv';

dotenv.config();

const productRoutes = express.Router();
const store = new ProductStore();

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await store.index();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const product = await store.show(req.params.id as string);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const newProduct = await store.create(req.body);
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

productRoutes.get('/api/products', getProducts);
productRoutes.get('/api/products/:id', getProduct);
productRoutes.post('/api/products', createProduct);
export default productRoutes;