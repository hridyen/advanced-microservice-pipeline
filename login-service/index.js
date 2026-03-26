const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Login  test Run');
});

app.listen(3003, () => {
    console.log('Login service run on port 3003');
});