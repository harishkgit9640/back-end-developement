import express from 'express';
const app = express();
const port = 5000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/about', (req, res) => {
    res.send('<h1>This is from back-end server</h1>')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})