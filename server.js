const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')

let con  = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: 'test',
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
    let sql
    if(criteria === "all") {
        sql = "select * from alumni"
    } else {
        criteria = parseInt(criteria)
        sql = `select * from alumni where id=${criteria}`
    }
    
    con.query(sql, (err, result, fields) => {
        if (err) throw err
        res.send(result)
    })
})

app.post('/alumni', (req, res) => {
    let { nama, tahunlulus, jurusan, status  } = req.body

    // let sql = `insert into test value (${req.body.age}, "${req.body.name}")`
    // con.query(sql, (err, result) => {
    //     if (err) throw err;
    //     res.send('record inserted')
    // })

    let sql = `insert into alumni(nama, tahunLulus, jurusan, status) value ("${req.body.nama}", ${req.body.tahunlulus}, ${req.body.jurusan}, "${req.body.status}")`
    con.query(sql, (err, result) => {
        if(err) throw err
        res.send('record inserted')
    })
})

app.listen(port, () => {console.log(`server is running on port ${port}`)})