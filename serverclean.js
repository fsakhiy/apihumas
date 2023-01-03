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
const multer = require('multer')
const path = require('path')
const qs = require('querystring')
const bodyparser = require('body-parser')

const transporter = mail.createTransport({
    host: "smtp.office365.com",
    port: 587,
    auth: emailconfig
})

let con = mysql.createConnection(mysqlconfig)
con.connect((err) => {if(err)throw err; console.log('connected')})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads")
    },
    filename: (req, file, cb) => {
        const name = Date.now() + path.parse(file.originalname).ext
        cb(null, name)
    }
})

const upload = multer({storage: storage})

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

app.get('/auth', (req, res) => {
    res.sendFile(__dirname + "/static/auth.html")
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

// app.use(upload.array())
// app.use(express.static('uploads'))

app.post('/upload/cv', upload.single('cv'), (req, res) => {
    console.log(Date.now())
    res.send(req.body)
})

// app.post('/signup', async (req, res) => {
//     const {username, password, idAlumni, admin, email} = req.body
//     const hashedPassword = await bcrypt.hash(password, 10)
//     con.query(`insert into user (username, password, idAlumni, isAdmin, email) value ("${username}", "${hashedPassword}", ${idAlumni}, ${admin}, '${email}')`, (err) => {
//         if(err) throw err
//         res.status(201).send('created!')
//     })
// })

app.post('/signup', async (req, res) => {
    const {username, password, email, admin} = req.body
    const {nama,tahunlulus,jurusan,status,namakampus,alamatkampus,namakantor,alamatkantor,namausaha,alamatusaha} = req.body
    const hashPass = await bcrypt.hash(password, 10)
    const insertalumnidata = `insert into alumni(nama, tahunLulus,jurusan,status,namaKampus,alamatKampus,namaKantor,alamatKantor,namaUsaha,alamatUsaha) value ("${nama}", ${tahunlulus} , ${jurusan},"${status}","${namakampus}","${alamatkampus}","${namakantor}","${alamatkantor}","${namausaha}","${alamatusaha}")`
    // con.query(sql, (err) => {
    //     if(err) throw err
    //     res.status(200).send()
    // })
    con.query(insertalumnidata, (err) => {
        if (err) throw err
        con.query(`select id from alumni where nama='${nama}'`, (err, result) => {
            if (err) throw err
            const idalumni = JSON.parse(JSON.stringify(result))[0].id
            const createuser = `insert into user (username,password,idAlumni,isAdmin,email) value ("${username}", "${hashPass}", ${idalumni}, ${false},"${email}")`
            con.query(createuser, (err) => {
                if (err) throw err
                res.status(200).send()
            })
        })
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

app.post('/forgot', (req, res) => {
    const email = req.body.email
    con.query(`select * from user where email='${email}'`, (err, result) => {
        if (err) throw err
        result = String(JSON.parse(JSON.stringify(result))[0])
        if(result == "undefined") {
            res.status(401).send('email not found')
        } else {
            const token = jwt.sign({ email: email}, process.env.RESET_KEY, { expiresIn: "15m"})
            const mailOptions = {
                from: "apihumastesting@outlook.com",
                to: `${email}`,
                subject: "Password Reset for Career8",
                html: `<h1>Password reset for your Career8 account:</h1><a href="https://apihumas.fairuzsakhiy.com/resetpassword?token=${token}">Reset Password</a></form>`
            }
        
            transporter.sendMail(mailOptions, (err, info) => {
                if(err) throw err
                res.send('email sent: ' + info.response)
            })
        }
    })
})

app.use(express.static('static/'))

app.get('/resetpassword', express.static('public'), (req, res) => {
    const token = jwt.verify(req.query.token, process.env.RESET_KEY)
    if(token) {
        res.sendFile(__dirname + "/static/reset.html")
    }
})

const urlEncoderParser = bodyparser.urlencoded({extended: false})

app.post('/resetpassword', express.static('public'), urlEncoderParser, async (req, res) => {
    const token = jwt.verify(req.body.token, process.env.RESET_KEY)
    if(req.body.password == req.body.passwordconfirmation) {
        const password = await bcrypt.hash(req.body.password, 10)
        con.query(`update user set password='${password}' where email='${token.email}'`, (err) => {
            if(err) throw err
            res.status(200).sendFile(__dirname + "/static/passwordupdated.html")
        })
    } else {
        res.redirect(`https://apihumas.fairuzsakhiy.com/resetpassword?token=${req.body.token}?password=wrong`)
    }
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