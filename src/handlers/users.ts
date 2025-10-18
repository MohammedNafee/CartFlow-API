/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A single user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User created successfully, returns a JWT token string
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */

/**
 * @swagger
 * /api/users/authenticate:
 *   post:
 *     summary: Authenticate a user (login)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Authentication successful, returns a JWT token string
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       '401':
 *         description: Invalid credentials
 */

import express from 'express';
import { Request, Response } from 'express';
import { User, UserStore } from '../models/user';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authorize as requireAuth } from '../services/auth';

dotenv.config();

const userRoutes = express.Router();
const store = new UserStore();

export const index = async (_req: Request, res: Response) => {
    requireAuth(_req, res);
    try {
        const users = await store.index();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to get users.` });
    }
};

export const show = async (req: Request, res: Response) => {
    requireAuth(req, res);
    const userId = req.params.id;
    try {
        const user = await store.show(userId as string);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to get user.` });
    }
};

export const create = async (req: Request, res: Response) => {
    //requireAuth(req, res);
    const user: User = {
        id: '',
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
    };
    try {
        const newUser = await store.create(user);

        const token = jwt.sign(
            { user: newUser }, 
            process.env.TOKEN_SECRET as string
        );
        res.json(token);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to create user.` });
    }
};

export const authenticate = async (req: Request, res: Response) => {
    const user: User = { 
        id: '',
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
    };
    try {
        const authenticatedUser = await store.authenticate(user.firstName, user.lastName, user.password);
        if (authenticatedUser) {
            const token = jwt.sign(
                { user: authenticatedUser }, 
                process.env.TOKEN_SECRET as string
            );
            res.json(token);
        } else {
            res.status(401).json({ error: `Invalid credentials.` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to authenticate user.` });
    }
};

userRoutes.get('/api/users', index);
userRoutes.get('/api/users/:id', show);
userRoutes.post('/api/users', create);
userRoutes.post('/api/users/authenticate', authenticate);
export default userRoutes;