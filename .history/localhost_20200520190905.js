const express = require('express')

const app = express()
app.use(express.static('./'));

const port = 3000

app.get('/', (req, res) => res.sendFile(__dirname + '/planets.html'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))