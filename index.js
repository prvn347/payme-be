const express = require("express");
const cors = require("cors")
const app = express()
const jwt = require('jsonwebtoken')




app.use(cors())
app.use(express.json())


const rootRouter = require('./routes/index')

app.use("/api/v1",rootRouter)

const PORT = 3000;
app.listen(PORT)
