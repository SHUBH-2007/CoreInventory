const jwt = require("jsonwebtoken")
const JWT_SECRET = "hackathon_secret_key"
const express = require("express")
const cors = require("cors")
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes")
const stockRoutes = require("./routes/stockRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const locationRoutes = require("./routes/locationRoutes");

require("./db/initDB")



const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/products", productRoutes);
app.use("/stock", stockRoutes);
app.use("/locations", locationRoutes);
app.use("/inventory", inventoryRoutes);


app.use((err, req, res, next) => {
  console.error("Server Error:", err)

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message
  })
})


app.get("/", (req, res) => {
  res.send("CoreInventory Backend Running")
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})