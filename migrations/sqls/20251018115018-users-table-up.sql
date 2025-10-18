/* Replace with your SQL commands */
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(50) UNIQUE NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);