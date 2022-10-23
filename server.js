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

//-------------------- GET ------------------

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html')
})

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

app.get('/jurusan/:criteria', (req, res) => {
    let id = req.params.criteria
    let sql

    if(id === "all" || id === ""){
        sql = `select * from jurusan`
    } else {
        id = parseInt(id)
        sql = `select * from jurusan where id=${id}`
    }

    con.query(sql, (err, result, fields) => {
        if(err) throw err
        res.send(result)
    })
})

//--------------------- POST -----------------

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

app.use('/login', (req, res) => {
    let { username, password, token } = req.body
    let sql = `select password from alumni where username='${username}'`
    con.query(sql, (err, result) => {
        if(err) throw err
        res.send(result)
    })
})

//--------------------- PATCH -------------------

app.patch('/alumni', (req, res) => {
    let { id, where, fix } = req.body
    let sql
    if(typeof fix == "number") {
        sql = `update alumni set ${where}=${fix} where id=${id}`
    } else if (typeof fix == "string") {
        sql = `update alumni set ${where}="${fix}" where id=${id}`
    }
    con.query(sql, (err, result) => {
        if (err) throw err
        res.send(`${where} is set to ${fix} at ${id}`)
    })
})

app.patch('/lowongan', (req, res) => {
    let { id, where, fix } = req.body
    let sql
    if(typeof fix == "number") {
        sql = `update lowongan set ${where}=${fix} where id=${id}`
    } else if (typeof fix == "string") {
        sql = `update lowongan set ${where}="${fix}" where id=${id}`
    }
    con.query(sql, (err, result) => {
        if (err) throw err
        res.send(`${where} is set to ${fix} at ${id}`)
    })
})

//--------------------- DELETE -------------------

app.delete('/alumni/:id', (req, res) => {
    let id = req.params.id
    let sql = `delete from alumni where id=${id}`
    con.query(sql, (err, result) => {
        if (err) throw err
        res.send('data destroyed')
    })
})

app.delete('/lowongan/:id', (req, res) => {
    let id = req.params.id
    let sql = `delete from lowongan where id=${id}`
    con.query(sql, (err, result) => {
        if (err) throw err
        res.send('data destroyed')
    })
})

app.listen(port, () => {console.log(`server is running on port ${port}`)})