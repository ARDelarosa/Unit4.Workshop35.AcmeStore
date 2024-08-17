const express = require ('express');
const app = express();
app.use(express.json());
app.use(require('morgan')('dev'));
const {client,
    createTables,
    createUser,
    createProduct,
    fetchUsers,
    fetchProducts,
    createFavorite,
    fetchFavorites,
    deleteFavorite
    } = require ('./db');

// api routes
// get all users
app.get('/api/users', async(req, res, next)=>{
    try{
        res.send(await fetchUsers());
    } catch(error) {
        next(error)
    }
})
// get all products
app.get('/api/products', async(req, res, next)=>{
    try{
        res.send(await fetchProducts());
    } catch(error) {
        next(error)
    }
})
// get all favorites
app.get('/api/users/:user_id/favorites', async(req, res, next)=>{
    try{
        res.send(await fetchFavorites());
    } catch(error) {
        next(error)
    }
})
// add new user favorite
app.post('/api/users/:user_id/favorites', async(req, res, next)=>{
    try{
        const user_id = req.params.user_id
        const product_id = req.body.product_id
        res.send(await createFavorite({user_id, product_id}));
    } catch(error) {
        next(error)
    }
})
// delete user favorite
app.delete('/api/users/:user_id/favorites/:product_id', async(req, res, next)=>{
    try{
        const product_id = req.params.product_id
        const currentUserId = req.params.user_id
            await deleteFavorite(product_id, currentUserId) &&
            res.sendStatus(204)
    } catch(error) {
        next(error)
    }
})

// SQL is created
const iniit = async()=>{
    await client.connect()
    console.log('connected to the database')
    await createTables()
    console.log('created our tables')
    await Promise.all(
        [createUser("Amy", "password"),
        createUser("David", "password1234"),
        createUser("Rosa", "password5678"),
        createProduct("PlayStation 5"),
        createProduct("Xbox Series X"),
        createProduct("Nintendo Switch")
    ]);
    console.log("created users and products");
    const users = await fetchUsers();
    const products = await fetchProducts();
    console.log(users, products);
    await Promise.all([
        createFavorite({
        user_id: users[0].id,
        product_id: products[0].id
    }),createFavorite({
        user_id: users[0].id,
        product_id: products[1].id
    }),createFavorite({
        user_id: users[0].id,
        product_id: products[2].id
    }),createFavorite({
        user_id: users[1].id,
        product_id: products[2].id
    }),createFavorite({
        user_id: users[2].id,
        product_id: products[1].id
    })]);

    const favorites = await fetchFavorites();
    //console.log(favorites);
    
    await deleteFavorite(favorites[4].id,
        users[2].id
    );

    const favoritesTwo = await fetchFavorites();
    //console.log(favoritesTwo);

    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port${port}`));

}

iniit()