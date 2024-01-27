// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import express from 'express'
const app = express();
dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('<h1>This is from back-end server</h1>')
})


app.get('/about', (req, res) => {
    res.send('<h1>Hello, I am Harish | Software Engineer </h1>')
})

app.listen(PORT, () => {
    console.log(`⚙️ Server is running at PORT : ${PORT}`);
});