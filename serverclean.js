const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const mysqlconfig = require(__dirname + '/mysqlconfig.js')

let con = mysql.createConnection(mysqlconfig)
con.connect((err) => {if(err)throw err; console.log('connected')})

app.use(express.json())

app.get('/:data/:crieteria', (req, res) => {
    const data = req.params.data
})