import pool from '../database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    password: string;
};

export class UserStore {
    async index(): Promise<User[]> {
        try {
            const conn = await pool.connect();

            const sql = 'SELECT id, firstname, lastname FROM users';
            const result = await conn.query(sql);
            
            conn.release();
            
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get users. Error: ${err}`);
        }
    };

    async show(id: string): Promise<User> {
        try {
            const conn = await pool.connect();
            const sql = 'SELECT id, firstname, lastname FROM users WHERE id=($1)';
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Could not get user. Error: ${err}`);
        }
    };

    async hashPassword(password: string): Promise<string> {
        const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS as string) : 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const pepper = process.env.BCRYPT_PASSWORD_SALT as string;

        const hashedPassword = await bcrypt.hash(password + pepper, salt);
        
        return hashedPassword;
    };

    async create(u: User): Promise<User> {
        try {
            const conn = await pool.connect();
            const sql = 'INSERT INTO users (firstname, lastname, password_hash) VALUES($1, $2, $3) RETURNING *';
            
            const hashedPassword = await this.hashPassword(u.password);
            
            const result = await conn.query(sql, [u.firstName, u.lastName, hashedPassword]);
            const user = result.rows[0];
            
            conn.release();
            
            return user;
        } catch (err) {
            throw new Error(`Could not create user. Error: ${err}`);
        }
    };

    async authenticate(firstName: string, lastName: string, password: string): Promise<User | null> {
        try {
            const conn = await pool.connect();

            const sql = 'SELECT * FROM users WHERE firstname=($1) AND lastname=($2)';
            const result = await conn.query(sql, [firstName, lastName]);
            const user = result.rows[0];
            // release connection early
            conn.release();

            const pepper = process.env.BCRYPT_PASSWORD_SALT ? process.env.BCRYPT_PASSWORD_SALT as string : '';

            // stored hash column is `password_hash` (see create()). Ensure it exists before comparing.
            if (user && user.password_hash && (await bcrypt.compare(password + pepper, user.password_hash))) {
                return user;
            }
            return null;
        } catch (err) {
            throw new Error(`Could not authenticate user. Error: ${err}`);
        }
    };
}