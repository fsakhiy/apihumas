require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mysqlconfig = require(__dirname + '/mysqlconfig.js')

let con = mysql.createConnection(mysqlconfig)
con.connect((err) => {if(err)throw err; console.log('connected')})

app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/static/docs.html")
})

app.get('/delete', (req, res) => {
    res.sendFile(__dirname + "/static/delete.html")
})

app.get('/post', (req, res) => {
    res.sendFile(__dirname + "/static/post.html")
})

app.get('/get', (req, res) => {
    res.sendFile(__dirname + "/static/get.html")
})

app.get('/patch', (req, res) => {
    res.sendFile(__dirname + "/static/patch.html")
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

app.post('/add/:typeof', (req, res) => {
    
    if(req.params.typeof == "alumni") {
        const { jurusan, tahunLulus, nama, status, namaKampus, alamatKampus, namaKantor, alamatKantor, namaUsaha, alamatUsaha } = req.body
        con.query(`select id from jurusan where abv='${jurusan}'`, (err, result) => {
            if(err) throw err
            const jurusanParsed = JSON.parse(JSON.stringify(result[0]))
            con.query(`insert into alumni(nama, tahunLulus, jurusan, status, namaKampus, alamatKampus, namaKantor, alamatKantor, namaUsaha, alamatUsaha) values ("${nama}", ${tahunLulus}, ${jurusanParsed.id}, '${status}', '${namaKampus}', '${alamatKampus}', '${namaKantor}', '${alamatKantor}', '${namaUsaha}', '${alamatUsaha}')`, (err, result) => {
                if(err) throw err
                res.status(201).send('success')
            })
        })
    }

    else if(req.params.typeof == "jurusan") {
        const {nama, abv, deskripsi} = req.body
        con.query(`insert into jurusan(nama, abv, deskripsi) value ('${nama}', '${abv}', '${deskripsi}')`, (err, result) => {
            if(err) throw err
            res.status(201).send('success')
        })
    }
    
    else if(req.params.typeof == "lowongan") {
        const {judul, deskripsi, kemampuanDibutuhkan, jenisPekerjaan} = req.body
        con.query(`insert into lowongan(judul, deskripsi, kemampuanDibutuhkan, jenisPekerjaan) value ('${judul}', '${deskripsi}','${kemampuanDibutuhkan}','${jenisPekerjaan}')`, (err, result) => {
            if(err) throw err
            res.status(201).send('success')
        })
    }

    else if(req.params.typeof == "pelamarKerja") {
        const {idAlumni, idLowongan} = req.body
        con.query(`insert into pelamarKerja(idAlumni, idLowongan) value (${idAlumni}, ${idLowongan})`, (err, result) => {
            if(err) throw err
            res.status(201).send('success')
        })
    }
})

app.post('/signup', async (req, res) => {
    const {username, password, idAlumni} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    con.query(`insert into user (username, password, idAlumni) value ("${username}", "${hashedPassword}", ${idAlumni})`, (err) => {
        if(err) throw err
        res.status(201).send('created!')
    })
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    con.query(`select password from user where username='${username}'`,async (err, result) => {
        if(err) throw err
        //result = String(JSON.parse(JSON.stringify(result))[0].pw)
        result = String(JSON.parse(JSON.stringify(result))[0].password)
        const data = { username: username}
        if(await bcrypt.compare(password, result)) {
            const accessToken = jwt.sign(data, process.env.SECRET_KEY)
            res.status(200).send(accessToken)
        } else {
            res.sendStatus(401)
        }
    })
})

app.patch('/update/:column', (req, res) => {
    const { column } = req.params
    const { data, id, changes } = req.body
    if(data == "alumni") {
        con.query(`update alumni set ${column} = '${changes}' where id=${id}`, (err, result) => {
            if(err) throw err
            res.status(200).send('data updated')
        })
    } else if(data == "lowongan") {
        con.query(`update lowongan set ${column} = '${changes}' where id=${id}`, (err, result) => {
            if(err) throw err
            res.status(200).send('data updated')
        })   
    }
})

app.delete('/delete/:data/:id', (req, res) => {
    const {id, data} = req.params
    if(data == "alumni") {
        con.query(`delete from alumni where id=${id}`, (err, result) => {
            if(err) throw err
            res.status(200).send('DESTROOOOYYYEEED!!!!!')
        })
    } else if(data == "lowongan") {
        con.query(`delete from lowongan where id=${id}`, (err, result) => {
            if(err) throw err
            res.status(200).send('DESTROYED!')
        })
    }
})

app.get('/test', authenticate, (req,res) => {
    res.send(req.username)
})

function authenticate(req, res, next) {
    const token = req.body.authtoken
    if(token == null) return res.status(401).send('token missing')
    jwt.verify(token, process.env.SECRET_KEY, (err, username) => {
        if(err) return res.status(403).send("error token wrong")
        req.username = username
        next()
    })
}

app.listen(port, () => console.log(`server is running on ${port}`))