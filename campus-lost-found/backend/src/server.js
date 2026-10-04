const app = require("./app");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 5000;
fs.mkdirSync(path.join(__dirname,"../uploads"),{recursive:true});
app.listen(PORT,()=>console.log(`API running on http://localhost:${PORT}`));
