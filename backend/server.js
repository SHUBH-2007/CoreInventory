const express = require("express")
const cors = require("cors")

require("./db/initDB")

const authRoutes = require("./routes/authRoutes")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("CoreInventory Backend Running")
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})