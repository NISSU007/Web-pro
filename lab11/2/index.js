const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// เชื่อมต่อฐานข้อมูล (ต้องมีไฟล์ inventory.db อยู่ที่โฟลเดอร์เดียวกัน)
const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error('Error connecting to database:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

// หน้าหลัก (แสดงรายการสินค้าทั้งหมด)
app.get('/', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.render('index', { products: rows });
    });
});

// เพิ่มสินค้าใหม่
app.post('/add', (req, res) => {
    const { name, category, price } = req.body;
    db.run("INSERT INTO products (name, category, price) VALUES (?, ?, ?)", 
        [name, category, price], (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/');
    });
});

// เปิดหน้าแก้ไขสินค้า
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        res.render('edit', { product: row });
    });
});

// บันทึกการแก้ไขข้อมูลสินค้า
app.post('/edit/:id', (req, res) => {
    const { name, category, price } = req.body;
    const id = req.params.id;
    db.run("UPDATE products SET name = ?, category = ?, price = ? WHERE id = ?", 
        [name, category, price, id], (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/');
    });
});

// ลบสินค้า
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM products WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).send(err.message);
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
