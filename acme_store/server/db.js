const pg = require('pg')
const client = new pg.Client(process.env.DATABASEURL || 'postgres://postgres:Viper001@localhost:5432/acme_store_db')
const bcrypt = require('bcrypt');

// Database initialization layer
const createTables = async()=>{
    const SQL =`
    DROP TABLE IF EXISTS favorites CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS products CASCADE;

    CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(20) NOT NULL,
    password VARCHAR(100)
    );
    CREATE TABLE products(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(20) NOT NULL
    );
    CREATE TABLE favorites(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    CONSTRAINT unique_favorites UNIQUE (user_id, product_id)
    );
    `
    await client.query(SQL);
}

const createUser = async (username, password)=>{
    const SQL = `
    INSERT INTO users(username, password)
    VALUES($1, $2)
    RETURNING *;
    `
    const response = await client.query(SQL, [username, await bcrypt.hash(password, 5)]);
    //console.log("1", await bcrypt.hash("sh", 5), "2", await bcrypt.hash(password, 5))
    return  response.rows[0]
}

const createProduct = async (name)=>{
    const SQL = `
    INSERT INTO products(name)
    VALUES($1)
    RETURNING *;
    `
    const response = await client.query(SQL, [name]);
    return  response.rows[0]
}

const fetchUsers = async ()=>{
    const SQL = `
    SELECT *
    FROM users;
    `
    const response = await client.query(SQL);
    return  response.rows
}

const fetchProducts = async ()=>{
    const SQL = `
    SELECT *
    FROM products;
    `
    const response = await client.query(SQL,);
    return  response.rows
}

const createFavorite = async ({product_id, user_id})=>{
    //console.log("here", product_id, user_id);
    const SQL = `
    INSERT INTO favorites(product_id, user_id)
    VALUES($1, $2)
    RETURNING *;
    `
    const response = await client.query(SQL, [product_id, user_id]);
    return  response.rows[0]
}

const fetchFavorites = async ()=>{
    const SQL = `
    SELECT *
    FROM favorites;
    `
    const response = await client.query(SQL);
    return  response.rows
}

const deleteFavorite = async (favorite_id, user_id)=>{
    const SQL = `
    DELETE
    FROM favorites
    WHERE id  = $1 AND user_id = $2;
    `
    const response = await client.query(SQL, [favorite_id, user_id]);
    return  response.rows
}

module.exports = {client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    deleteFavorite
}