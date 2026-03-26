const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Config Service taking off');
});

app.listen(3002, () => {
    console.log('Config service running on port 3002');
});