const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Auth Service Running for test ');
});

app.listen(3001, () => {
    console.log('Auth service running on port 3001');
});
