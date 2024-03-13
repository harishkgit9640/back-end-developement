import express from 'express'
const app = express();


app.get('/', (req, res) => {
    res.send('<h1>This is from back-end server</h1>')
})


app.get('/about', (req, res) => {
    res.send('<h1>Hello, I am Harish | Software Engineer </h1>')
})

export { app };