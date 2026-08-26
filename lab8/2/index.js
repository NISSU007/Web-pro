const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(__dirname));

app.get('/api/albums', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'albums.csv');

        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split(/\r?\n/).filter(line => line.trim() !== ''); 
        
        const albums = lines.slice(1).map(line => {
            const fields = line.split(',');
            return {
                song: fields[0],
                artist: fields[1],
                album: fields.slice(2, -3).join(','), 
                year: fields[fields.length - 3],
                genre: fields[fields.length - 2],
                cover: fields[fields.length - 1]
            };
        });
        
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));