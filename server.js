const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')

let con  = mysql.createConnection({
    host: "localhost",
    user: "user",
    password: "pass",
    database: "database",
    port: 3306
})

con.connect((err) => {
    if(err) throw err
    console.log("Connected!")
})

app.use(express.json())

app.get('/', (req, res) => {
    res.send('<h1>Welcome to the smk8 api</h1>')
})

app.get('/alumni/:criteria', (req, res) => {
    let criteria = req.params.criteria
    if(criteria == "all") {
        con.query("select * from alumni", (err, result, fields) => {
            if(err) throw err
            console.log(result)
        })
    }
})

app.listen(port, () => {console.log(`server is running on port ${port}`)})