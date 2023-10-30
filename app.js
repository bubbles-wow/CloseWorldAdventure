const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, 'game')));

app.get('/', (res) => {
    res.sendFile(path.join(__dirname, 'game', 'index.html'));
});

const port = 8080;
app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}/`);
});