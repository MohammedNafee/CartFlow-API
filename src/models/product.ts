import pool from '../database';
import dotenv from 'dotenv';

dotenv.config();

export type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
};

export class ProductStore {
    async index(): Promise<Product[]> {
        try {
            const conn = await pool.connect();
            const sql = 'SELECT * FROM products';
            const result = await conn.query(sql);
            conn.release();
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get products. Error: ${err}`);
        }
    }

    async show(id: string): Promise<Product> {
        try {
            const conn = await pool.connect();
            const sql = 'SELECT * FROM products WHERE id=($1)';
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not get product. Error: ${err}`);
        }
    }

    async create(product: Product): Promise<Product> {
        try {
            const conn = await pool.connect();
            const sql = 'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *';
            const result = await conn.query(sql, [product.name, product.price, product.description]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not create product. Error: ${err}`);
        }
    }
}