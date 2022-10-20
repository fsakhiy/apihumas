const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the smk8 api</h1>')
})

app.listen(port, () => {console.log(`server is running on port ${port}`)})