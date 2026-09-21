const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// เชื่อมต่อฐานข้อมูล customers.db
const db = new sqlite3.Database(path.join(__dirname, 'customers.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database (customers.db).');
    }
});

// (A) สุ่มอ่านข้อมูลจาก database มา 1 รายการ แล้วแสดงในฟอร์ม
app.get('/', (req, res) => {
    const query = `SELECT * FROM customers ORDER BY RANDOM() LIMIT 1`;
    db.get(query, [], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Database error");
        }
        res.render('index', { emp: row || {} });
    });
});

// (B) ปุ่ม Save Data: นำข้อมูลในฟอร์มไปจัดเก็บ cookie และลบข้อมูลในฟอร์มออก
app.post('/save-data', (req, res) => {
    const empData = {
        CustomerId: req.body.CustomerId,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Address: req.body.Address,
        Email: req.body.Email,
        Phone: req.body.Phone
    };

    // บันทึกลง Cookie ชื่อ 'empCookie'
    res.cookie('empCookie', empData, { maxAge: 24 * 60 * 60 * 1000 }); // หมดอายุใน 1 วัน

    // ส่งฟอร์มว่างกลับไป (ลบข้อมูลในฟอร์มออก)
    res.render('index', { emp: {} });
});

// (C) ปุ่ม Show Data: นำข้อมูลที่เก็บไว้ใน cookie มาแสดงในฟอร์ม
app.get('/show-data', (req, res) => {
    const savedData = req.cookies.empCookie || {};
    res.render('index', { emp: savedData });
});

// (D) ปุ่ม Clear Data: ลบข้อมูลใน cookie และลบข้อมูลในฟอร์มออก
app.get('/clear-data', (req, res) => {
    res.clearCookie('empCookie');
    res.render('index', { emp: {} });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
