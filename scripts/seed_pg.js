const {
    invoices,
    customers,
    revenue,
    users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const seedCustomers = async (client) => {

    try {
        await client.query(`CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            image_url VARCHAR(255) NOT NULL
        );`);
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await client.query(`ALTER TABLE customers ALTER COLUMN id SET DEFAULT uuid_generate_v4();`);

        console.log("Customers Table Created !!");

        await client.query('BEGIN');
        await Promise.all(
            customers.map(async (customer) => {
                return await client.query(` INSERT INTO customers (id, name, email, image_url) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING;`, [customer.id, customer.name, customer.email, customer.image_url]);
            }),
        );
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e
    }
}

const seedRevenue = async (client) => {

    try {
        await client.query(`CREATE TABLE IF NOT EXISTS revenue (
            month VARCHAR(4) NOT NULL UNIQUE,
            revenue INT NOT NULL
        );
        `);

        console.log("Revenue Table Created !!");

        await client.query('BEGIN');
        await Promise.all(
            revenue.map(async (rev) => {
                return await client.query(` INSERT INTO revenue (month,revenue) VALUES ($1, $2) ON CONFLICT (month) DO NOTHING;`, [rev.month, rev.revenue]);
            }),
        );
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e
    }
}

const seedInvoices = async (client) => {

    try {
        await client.query(`CREATE TABLE IF NOT EXISTS invoices (
            id UUID PRIMARY KEY,
            customer_id UUID NOT NULL,
            amount INT NOT NULL,
            status VARCHAR(255) NOT NULL,
            date DATE NOT NULL
        );`);
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await client.query(`ALTER TABLE invoices ALTER COLUMN id SET DEFAULT uuid_generate_v4();`);

        console.log("Invoices Table Created !!");

        await client.query('BEGIN');
        await Promise.all(
            invoices.map(async (invoice) => {
                return await client.query(` INSERT INTO invoices (customer_id, amount, status,date) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING;`, [invoice.customer_id, invoice.amount, invoice.status, invoice.date]);
            }),
        );
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e
    }
}

const seedUsers = async (client) => {

    try {
        await client.query(`CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );`);
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await client.query(`ALTER TABLE users ALTER COLUMN id SET DEFAULT uuid_generate_v4();`);

        console.log("Users Table Created !!");

        await client.query('BEGIN');
        await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return await client.query(` INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING;`, [user.id, user.name, user.email, hashedPassword]);
            }),
        );
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e
    }
}

async function main() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'nextjs-dashboard-postgres',
        user: 'postgres',
        password: 'admin',
    });

    const client = await pool.connect()

    await seedUsers(client);
    await seedCustomers(client);
    await seedInvoices(client);
    await seedRevenue(client);
    client.release();
}

main().catch((err) => {
    console.error(
        'An error occurred while attempting to seed the database:',
        err,
    );
});

//this code using node-postgres