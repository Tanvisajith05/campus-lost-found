const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/uploads", express.static(path.join(__dirname,"../uploads")));

app.get("/api/health", (req,res)=>res.json({ok:true}));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use((err,req,res,next)=>{
  console.error(err);
  if (err.message?.includes("Only JPG")) return res.status(400).json({message:err.message});
  res.status(500).json({message:"Unexpected server error"});
});

module.exports = app;
