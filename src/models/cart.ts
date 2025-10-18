import pool from "../database";
import dotenv from 'dotenv';

dotenv.config();    

export type Cart = {
    id: string;
    user_id: string;
    status: string;
    created_at: Date;
};

export class CartStore {
    async getActiveCartByUser(userId: string): Promise<Cart | null> {
        try {
            const conn = await pool.connect();
            const sql = 'SELECT * FROM carts WHERE user_id=($1) AND status=($2)';
            const result = await conn.query(sql, [userId, 'active']);
            conn.release();
            return result.rows[0] || null;
        } catch (err) {
            throw new Error(`Could not get active cart for user ${userId}. Error: ${err}`);
        }
    }

    async createCart(cart: Cart): Promise<Cart> {
        try {
            const conn = await pool.connect();
            const sql = 'INSERT INTO carts (user_id, status, created_at) VALUES ($1, $2, $3) RETURNING *';
            const result = await conn.query(sql, [cart.user_id, cart.status, cart.created_at]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not create cart. Error: ${err}`);
        }
    }

    async completeCart(cartId: string): Promise<Cart> {
        try {
            const conn = await pool.connect();
            const sql = 'UPDATE carts SET status=$1 WHERE id=$2 RETURNING *';
            const result = await conn.query(sql, ['completed', cartId]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not complete cart ${cartId}. Error: ${err}`);
        }
    }
}
