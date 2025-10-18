import pool from '../database';
import dotenv from 'dotenv';

dotenv.config();

export type Item = {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    price: number;
};

export class ItemStore {
    async addItemToCart(item: Item): Promise<Item> {
        try {
            const conn = await pool.connect();
            const sql = 'INSERT INTO items (cart_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *';
            const result = await conn.query(sql, [item.cart_id, item.product_id, item.quantity, item.price]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not add item to cart ${item.cart_id}. Error: ${err}`);
        }
    }

    async getItemsByCartId(cartId: string): Promise<Item[]> {
        try {
            // Get all items that share same cart_id
            const conn = await pool.connect();
            const sql = 'SELECT * FROM items WHERE cart_id = $1';
            const result = await conn.query(sql, [cartId]);
            conn.release();
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get items. Error: ${err}`);
        }
    }

    async getItemById(itemId: string): Promise<Item | null> {
        try {
            const conn = await pool.connect();
            const sql = 'SELECT * FROM items WHERE id=$1';
            const result = await conn.query(sql, [itemId]);
            conn.release();
            return result.rows[0] || null;
        } catch (err) {
            throw new Error(`Could not get item ${itemId}. Error: ${err}`);
        }
    }

    async deleteItem(itemId: string): Promise<Item> {
        try {
            const conn = await pool.connect();
            const sql = 'DELETE FROM items WHERE id=$1 RETURNING *';
            const result = await conn.query(sql, [itemId]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not delete item ${itemId}. Error: ${err}`);
        }
    }

    async updateItemQuantity(itemId: string, quantity: number): Promise<Item> {
        try {
            const conn = await pool.connect();
            const sql = 'UPDATE items SET quantity = $1 WHERE id = $2 RETURNING *';
            const result = await conn.query(sql, [quantity, itemId]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not update item ${itemId}. Error: ${err}`);
        }
    }

    async removeItemFromCart(itemId: string): Promise<Item> {
        try {
            // Removed item from cart
            // decrease quantity by 1
            // if quantity reaches 0, delete the item entirely from the cart
            const item = await this.getItemById(itemId);
            if (item) {
                if (item.quantity > 1) {
                    return this.updateItemQuantity(itemId, item.quantity - 1);
                } else {
                    return this.deleteItem(itemId);
                }
            }
            throw new Error(`Item ${itemId} not found.`);
        } catch (err) {
            throw new Error(`Could not remove item ${itemId} from cart. Error: ${err}`);
        }
    }
}


