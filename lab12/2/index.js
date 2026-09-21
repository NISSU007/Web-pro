const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

const API_RESTAURANT = 'http://webdev.it.kmitl.ac.th:4000/restaurant';
const API_DETAIL = 'http://webdev.it.kmitl.ac.th:4000/detail/';

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'auntie-aun-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.get('/', (req, res) => {
    res.redirect('/menu');
});

app.get('/menu', async (req, res) => {
    try {
        const response = await fetch(API_RESTAURANT);
        const menuItems = await response.json();
        res.render('menu', { menuItems });
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        res.status(500).send('Error fetching menu data');
    }
});

app.get('/add-to-cart/:id', (req, res) => {
    const foodId = req.params.id;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    req.session.cart.push(foodId);
    res.redirect('/menu');
});

app.get('/cart', async (req, res) => {
    const cartIds = req.session.cart || [];
    let cartItems = [];
    let totalPrice = 0;

    try {
        for (const id of cartIds) {
            const response = await fetch(`${API_DETAIL}${id}`);
            const itemData = await response.json();
            cartItems.push(itemData);
            totalPrice += Number(itemData.price || 0);
        }
        res.render('cart', { cartItems, totalPrice });
    } catch (error) {
        console.error('Error fetching cart details:', error.message);
        res.status(500).send('Error fetching cart details');
    }
});

app.get('/confirm-order', (req, res) => {
    req.session.cart = [];
    res.redirect('/menu');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
