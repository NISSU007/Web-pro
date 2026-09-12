const express = require("express");
const port = 3000;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_BASE = 'http://webdev.it.kmitl.ac.th:4000';

app.get('/', (req, res) => {
    const endpoint = `${API_BASE}/restaurant`;
    fetch(endpoint)
        .then(response => response.json())
        .then(wsdata => {
            const cleanedData = wsdata.map(item => ({
                ...item,
                id: item.id || item.product_id || item._id,
                image: item.image ? (item.image.startsWith('/') ? item.image : `/${item.image}`) : ''
            }));
            res.render('index', { data: cleanedData });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Error fetching data");
        });
});

app.get('/detail/:id', (req, res) => {
    const id = req.params.id;
    const endpoint = `${API_BASE}/detail/${id}`;
    fetch(endpoint)
        .then(response => response.json())
        .then(wsdata => {
            let itemData = Array.isArray(wsdata) ? wsdata[0] : wsdata;

            if (!itemData) {
                return res.status(404).send("ไม่พบข้อมูลที่ระบุ");
            }

            itemData.id = itemData.id || itemData.product_id || id;
            if (itemData.image && !itemData.image.startsWith('/')) {
                itemData.image = `/${itemData.image}`;
            }

            res.render('detail', { item: itemData });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Error fetching detail");
        });
});

app.listen(port, () => {
    console.log(`Starting server at http://localhost:${port}`);
});
