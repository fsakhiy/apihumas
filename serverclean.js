require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mysqlconfig = require(__dirname + '/mysqlconfig.js')
const mail = require('nodemailer')
const emailconfig = require(__dirname + '/pass.js')

const transporter = mail.createTransport({
    service: "outlook",
    auth: emailconfig
})


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

app.post('/add/:typeof', authenticate, (req, res) => {
    
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
    con.query(`insert into user (username, password, idAlumni, admin) value ("${username}", "${hashedPassword}", ${idAlumni}, false)`, (err) => {
        if(err) throw err
        res.status(201).send('created!')
    })
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    con.query(`select password, idAlumni, admin, email from user where username='${username}'`,async (err, result) => {
        if(err) throw err
        //result = String(JSON.parse(JSON.stringify(result))[0].pw)
        let parsedPassword = String(JSON.parse(JSON.stringify(result))[0].password)
        let parsedID = String(JSON.parse(JSON.stringify(result))[0].idAlumni)
        let parsedAdmin = String(JSON.parse(JSON.stringify(result))[0].admin)
        let parsedEmail = String(JSON.parse(JSON.stringify(result))[0].email)
        con.query(`select alumni.nama from user inner join alumni on user.idAlumni=alumni.id where alumni.id=${parsedID}`, async (err, result) => {
            if(err) throw err
            let name = String(JSON.parse(JSON.stringify(result))[0].nama) 
                const data = { 
                    username: username,
                    id: parsedID,
                    name: name,
                    admin: parsedAdmin,
                    email: parsedEmail
                }
                if(await bcrypt.compare(password, parsedPassword)) {
                    const accessToken = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: "15m"})
                    const refreshToken = jwt.sign(data, process.env.REFRESH_KEY)
                    con.query(`insert into reftoken value ('${refreshToken}')`, (err) => {if (err) throw err})
                    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken})
                } else {
                    res.sendStatus(401)
                }
        })
    })
})

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken
    con.query(`select * from reftoken where refreshToken='${refreshToken}'`, (err, result) => {
        if(err)throw err
        const isAvailable = String(JSON.parse(JSON.stringify(result))[0])
        if(isAvailable == "undefined") {
            res.status(401).send('no')
        } else {
            jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, user) => {
                if(err) {
                    throw err
                    res.status(403).send('no')
                }
                const accessToken = jwt.sign({username: user.username, id: user.id, name: user.name, admin: user.admin, email: user.email}, process.env.SECRET_KEY, {expiresIn: "15m"})
                res.json({accessToken: accessToken})
            })
        }
    })
})

app.delete('/logout', (req, res) => {
    const refreshToken = req.body.refreshToken
    con.query(`delete from reftoken where refreshToken='${refreshToken}'`, (err) => {
        if(err) throw err
    })
    res.status(204).send('success')
})

app.patch('/update/:column', authenticate, (req, res) => {
    const { column } = req.params
    const { data, changes } = req.body
    let id
    if(req.user.admin == "1") {
        id = req.body.id
    } else {
        id = req.user.id
    }
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

app.post('/reset', authenticate, (req, res) => {
    const mailOptions = {
        from: "apihumastesting@outlook.com",
        to: `${req.user.email}`,
        subject: "Password Reset for Career8",
        text: `test`
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) throw err
        res.send('email sent: ' + info.response)
    })
})

app.delete('/delete/:data/:id', authenticate, (req, res) => {
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
    res.send(req.user)
})

function authenticate(req, res, next) {
    const token = req.body.authtoken
    if(token == null) return res.status(401).send('token missing')
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if(err) return res.status(403).send("error token wrong")
        req.user = user
        next()
    })
}

app.listen(port, () => console.log(`server is running on ${port}`))