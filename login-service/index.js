const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Login Service Run');
});

app.listen(3003, () => {
    console.log('Login service running on port 3003');
});