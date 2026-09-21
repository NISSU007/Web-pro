const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware setup
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key-for-your-store',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to database
const db = new sqlite3.Database('./phones.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database (phones.db).');
    }
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/menu');
});

// แสดงรายการสินค้าทั้งหมด
app.get('/menu', (req, res) => {
    db.all(`SELECT * FROM phones`, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Database error");
        } else {
            // เรียกใช้ views/showproducts.ejs
            res.render('showproducts', { data: rows, cartCount: (req.session.cart || []).length });
        }
    });
});

// เพิ่มสินค้าลงตะกร้า
app.get('/add-to-cart/:item', (req, res) => {
    const item = req.params.item;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    req.session.cart.push(item);
    console.log(`Item '${item}' added to cart...`);
    res.redirect('/menu');
});

// แสดงรายการสินค้าในตะกร้า
app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    console.log(`List in your cart: ${cart.join(', ')}`);

    if (cart.length === 0) {
        // เรียกใช้ views/showcart.ejs
        return res.render('showcart', { data: [], total: 0 });
    }

    const placeholders = cart.map(() => '?').join(',');
    const query = `SELECT * FROM phones WHERE id IN (${placeholders})`;

    db.all(query, cart, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Database error");
        } else {
            let total = 0;
            const counts = {};
            cart.forEach(id => counts[id] = (counts[id] || 0) + 1);

            const cartItems = rows.map(item => {
                const qty = counts[item.id] || 1;
                const subtotal = item.price * qty;
                total += subtotal;
                return { ...item, quantity: qty, subtotal: subtotal };
            });

            // เรียกใช้ views/showcart.ejs
            res.render('showcart', { data: cartItems, total: total });
        }
    });
});

// ล้างตะกร้าสินค้า
app.get('/clear-cart', (req, res) => {
    req.session.cart = [];
    res.redirect('/menu');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
