const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const fetch = require('node-fetch')
const { URLSearchParams } = require('url')

const app = express()
const port = 3000
dotenv.config()
const { CLIENT_ID, CLIENT_SECRET } = process.env

app.use('public', express.static(path.join(__dirname, 'public')))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  res.render('index', { CLIENT_ID })
})

app.get('/callback', async (req, res) => {
  const { code } = req.query
  const buff = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`, 'utf-8')
  const base64 = buff.toString('base64')

  const params = new URLSearchParams({
    "grant_type": "authorization_code",
    "code": code,
    "redirect_uri": `http://localhost:3000/callback`,
  });
  const authorizationTokens = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${base64}`,
    },
    body: params,
  })
    .then(response => response.json())
    .then(data => data)
    .catch(e => console.error(e))
  
  const user = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authorizationTokens.access_token}`
    }
  })
    .then(response => response.json())
    .then(data => data)
    .catch(e => console.error(e))

  const { display_name, id } = user
  const profile = {
    display_name,
    id,
  }
  res.render('profile', profile)
})

app.listen(port, () => {
  console.log('Example app listening on port ', port)
})
