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
    res.send(`<h1>Welcome to the smk 8 humas api</h1>
    <br><p>method:<br>
    get :   /alumni/:criteria<br>           
            /lowongan/:criteria<br>
            -> criteria = id or all(to display all of the data)<br>

    <br>
    post:   /alumni         -> json body nama, tahunlulus, jurusan, status<br>
            /lowongan       -> json body judul, deskripsi, kemampuan, jenis<br>
    <br>
    delete: /alumni/:id<br>
            /lowongan/:id<br>
    </p>`)
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
        sql = `update alumni set ${where}=${fix} where id=${id}`
    } else if (typeof fix == "string") {
        sql = `update alumni set ${where}="${fix}" where id=${id}`
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