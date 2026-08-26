const express = require('express');
const app = express();
const port = 3000;
const conn = require('./database');

// อนุญาต CORS ให้เบราว์เซอร์ดึงข้อมูลข้าม Domain ได้
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
    next();
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/books', (req, res) => {
    conn.query('SELECT * FROM books;', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.get('/api/books/:id', (req, res) => {
    conn.query('SELECT * FROM books WHERE id = ?;', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result[0]);
    });
});

app.post('/api/books', (req, res) => {
    const { id, title, author, category, price, stock } = req.body;
    const sql = "INSERT INTO books (id, title, author, category, price, stock) VALUES (?, ?, ?, ?, ?, ?)";
    conn.query(sql, [id, title, author, category, price, stock], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success' });
    });
});

app.post('/api/books/edit/:id', (req, res) => {
    const { title, author, category, price, stock } = req.body;
    const sql = "UPDATE books SET title=?, author=?, category=?, price=?, stock=? WHERE id=?";
    conn.query(sql, [title, author, category, price, stock, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success' });
    });
});

app.delete('/api/books/:id', (req, res) => {
    conn.query("DELETE FROM books WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success' });
    });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));