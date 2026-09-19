const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dbPath = path.join(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error('Error connecting to database:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

// 1. GET Route: หน้าแรก (แสดงตาราง)
app.get('/', (req, res) => {
    const query = 'SELECT * FROM todos';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Database Query Error:", err.message);
            return res.status(500).send(`Database error: ${err.message}`);
        }
        res.render('index', { data: rows });
    });
});

// 2. GET Route: เปิดหน้าฟอร์ม Add Todo
app.get('/add', (req, res) => {
    res.render('add'); // เรียกไฟล์ views/add.ejs
});

// 3. POST Route: รับข้อมูลจากหน้าฟอร์มแล้วบันทึก
app.post('/add', (req, res) => {
    const { title, description, deadline } = req.body;
    const query = `INSERT INTO todos (title, description, deadline, status) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [title, description, deadline, 0], function(err) {
        if (err) {
            console.error("Database Insert Error:", err.message);
            return res.status(500).send(`Error adding todo: ${err.message}`);
        }
        res.redirect('/'); // บันทึกเสร็จให้กลับไปหน้าแรก
    });
});

// PUT Route: สำหรับอัปเดตสถานะ Completed (ติ๊กถูก)
app.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const status = req.body.status; // รับค่า 1 (เสร็จแล้ว) หรือ 0 (ยังไม่เสร็จ)

    const query = `UPDATE todos SET status = ? WHERE id = ?`;
    db.run(query, [status, id], function(err) {
        if (err) {
            console.error("Database Update Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Status updated successfully" });
    });
});

app.listen(port, () => {
    console.log(`Starting server at http://localhost:${port}`);
});
