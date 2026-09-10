const express = require("express");
const port = 3000;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_BASE = 'http://webdev.it.kmitl.ac.th:4000';

app.get('/books', (req, res) => {
    const endpoint = `${API_BASE}/books`;    
    fetch(endpoint)
        .then(response => response.json())
        .then(wsdata => {
            res.render('books', { books: wsdata });            
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Error fetching books data");
        });
});

app.listen(port, () => {
    console.log(`Starting server at port ${port}`);
    console.log(`Lab 10/2 Books : http://localhost:${port}/books`);
});