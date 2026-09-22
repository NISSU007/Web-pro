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

// หน้าแสดงเมนู
app.get('/menu', async (req, res) => {
    try {
        const response = await fetch(API_RESTAURANT);
        const menuItems = await response.json();
        res.render('menu', { menuItems });
    } catch (error) {
        res.status(500).send('Error fetching menu data');
    }
});

app.get('/add-to-cart', (req, res) => {
    res.redirect('/menu');
});

// (A) เพิ่มสินค้าลงตะกร้าด้วย session
app.get('/add-to-cart/:id', (req, res) => {
    const foodId = req.params.id ? req.params.id.trim() : '';

    if (foodId && foodId !== 'undefined') {
        if (!req.session.cart) {
            req.session.cart = [];
        }
        req.session.cart.push(foodId);
        
        // แสดง ID สินค้าที่เพิ่มลงตะกร้า
        console.log(`Add to cart: ${foodId}`);
    }

    req.session.save(() => {
        res.redirect('/menu');
    });
});

// (B) แสดงรายการในตะกร้าและคำนวณราคารวม
app.get('/cart', async (req, res) => {
    const cartIds = req.session.cart || [];
    let cartItems = [];
    let totalPrice = 0;

    try {
        for (const id of cartIds) {
            const response = await fetch(`${API_DETAIL}${encodeURIComponent(id)}`);

            if (response.ok) {
                let itemData = await response.json();

                if (Array.isArray(itemData) && itemData.length > 0) {
                    itemData = itemData[0];
                }

                if (itemData && (itemData.name || itemData.price)) {
                    cartItems.push(itemData);
                    totalPrice += Number(itemData.price || 0);
                }
            }
        }
        res.render('cart', { cartItems, totalPrice });
    } catch (error) {
        res.status(500).send('Error fetching cart details');
    }
});

// (C) ยืนยันสั่งซื้อ คำนวณยอดรวม และล้างตะกร้า
app.get('/confirm-order', async (req, res) => {
    const cartIds = req.session.cart || [];
    let totalPrice = 0;

    try {
        for (const id of cartIds) {
            const response = await fetch(`${API_DETAIL}${encodeURIComponent(id)}`);
            if (response.ok) {
                let itemData = await response.json();
                if (Array.isArray(itemData) && itemData.length > 0) {
                    itemData = itemData[0];
                }
                if (itemData && itemData.price) {
                    totalPrice += Number(itemData.price);
                }
            }
        }
    } catch (error) {
        // หากเกิดข้อผิดพลาดในการคำนวณราคา ให้ข้ามไป
    }

    // แสดงยอดรวมตอน Confirm
    console.log(`Confirm order - Total: ${totalPrice} THB`);

    // ล้างตะกร้าสินค้า
    req.session.cart = [];
    res.redirect('/menu');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
