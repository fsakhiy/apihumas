const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')

let con  = mysql.createConnection({
    host: "localhost",
    user: "loc",
    password: "Loc#4096",
    database: 'api',
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

// app.get('/:data/:criteria', (req, res) => {
//     let criteria = req.params.criteria
//     let data = req.params.data
//     let sql

//     if(data === "alumni") {    
//         if(criteria === "all") {
//             sql = "select * from alumni"
//         } else {
//             criteria = parseInt(criteria)
//             sql = `select * from alumni where id=${criteria}`
//         }
//     } else if (criteria === "lowongan") {
//         if(criteria === "all") {
//             sql = "select * from lowongan"
//         } else {
//             criteria = parseInt(criteria)
//             sql = `select * from alumni where id=${criteria}`
//         }
//     }
    
//     con.query(sql, (err, result, fields) => {
//         if (err) throw err
//         res.send(result)
//     })
// })

app.get('/alumni/:criteria', (req, res) => {
    let criteria = req.params.criteria
    let sql 

    if(criteria === "all" || criteria === "") {
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

app.get('/lowongan/:criteria', (req, res) => {
    let criteria = req.params.criteria
    let sql
    
    if(criteria === "all" || criteria === "") {
        sql = "select * from lowongan"
    } else {
        criteria = parseInt(criteria)
        sql = `select * from lowongan where id=${criteria}`
    }

    con.query(sql, (err, result, fields) => {
        if (err) throw err
        res.send(result)
    })
})

app.post('/alumni', (req, res) => {
    let { nama, tahunlulus, jurusan, status  } = req.body

    let sql = `insert into alumni(nama, tahunLulus, jurusan, status) value ("${nama}", ${tahunlulus}, ${jurusan}, "${status}")`
    con.query(sql, (err, result) => {
        if(err) throw err
        res.send('record inserted')
    })
})

app.post('/lowongan', (req, res) => {
    let { judul, deskripsi, kemampuan, jenis} = req.body

    let sql = `insert into lowongan(judul, deskripsi, kemampuanDibutuhkan, jenisPekerjaan) value ("${judul}", "${deskripsi}", "${kemampuan}", "${jenis}")`
    con.query(sql, (err, result) => {
        if (err) throw err
        res.send('record inserted')
    })
})

app.delete('/:data/:id', (req, res) => {
    let sql
    let id = req.params.id
    let data = req.params.data
    if(data === "alumni") {
        sql = `delete from alumni where id=${id}}`
    }
})

app.listen(port, () => {console.log(`server is running on port ${port}`)})