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


app.get('/:data/:criteria', (req, res) => {
    const data = req.params.data
    let criteria = req.params.criteria
    let sql = `select * from ${data}`

    if(data == "lowongan" || data == "alumni" || data == "jurusan") {
        
        if(criteria != "all") {
            criteria = parseInt(criteria)
            sql = `select * from ${data} where id=${criteria}`
        } else {
            sql = `select * from ${data}`
        }
    } else {
        res.status(401)
        res.send('not authorized')
        return
    }

    con.query(sql, (err, result) => {
        if (err) throw err
        res.send(result)
    })
})

//--------------------- POST -----------------

app.post('/alumni', (req, res) => {
    let { nama, tahunlulus, jurusan, status, namakampus, alamatkampus, namakantor, alamatkantor, namausaha, alamatusaha } = req.body

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

app.post('/user', (req, res) => {
    const { idalumni, username, password } = req.body
    let sql = `insert into user(username, password, idAlumni) value ('${username}', '${password}', ${idalumni})`
    con.query(sql, (err,result) => {
        if(err) throw err
        res.send('record inserted')
    })
})

app.post('/login', (req, res) => {
    let { username, password, token } = req.body
    let sql = `select password from user where username='${username}'`
    con.query(sql, (err, result) => {
        if(err) throw err
        //res.send(result)
        const pass = JSON.parse(result)
        res.send(pass)
    })
    
})

app.post('/jurusan', (req, res) => {
    const { nama, abv, deskripsi } = req.body
    let sql = `insert into jurusan (nama, abv, deskripsi) value ('${nama}', '${abv}', '${deskripsi}')`
    con.query(sql, (err, result) => {
        if(err) throw err
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
        sql = `update lowongan set ${where}=${fix} where id=${id}`
    } else if (typeof fix == "string") {
        sql = `update lowongan set ${where}="${fix}" where id=${id}`
    }
    con.query(sql, (err, result) => {
        if (err) throw err
        res.send(`${where} is set to ${fix} at ${id}`)
    })
})

app.patch('/user/resetpassword', (req, res) => {
    const { username, password } = req.body
})

//--------------------- DELETE -------------------

app.delete('/:data/:id', (req, res) => {
    const data = req.params.data
    let id = req.params.id
    let sql

    if(data == "alumni" || data == "lowongan") {
        sql = `delete from ${data} where id=${id}`
    } else {
        res.status(400)
        res.send("bad request")
        return
    }   
    con.query(sql, (err, result) => {
        if (err) throw err
        res.send("data destroyed")
    })
})

app.listen(port, () => {console.log(`server is running on port ${port}`)})