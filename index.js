const router = require('./routes/routes')
const express = require('express')
const app = express()

app.use('/', router )

app.listen(3000, () => {
  console.log('server listening on port 3000!')
})