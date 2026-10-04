const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { createItem, listItems, getItem, myReports, myClaims } = require("../controllers/itemController");
const { createClaim } = require("../controllers/claimController");

const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null, path.join(__dirname,"../../uploads")),
  filename: (req,file,cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req,file,cb) => {
    const ok = ["image/jpeg","image/png","image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only JPG, PNG and WEBP images are allowed"), ok);
  }
});

router.get("/", listItems);
router.get("/:id", getItem);
router.post("/", authenticate, upload.single("image"), createItem);
router.get("/me/reports", authenticate, myReports);
router.get("/me/claims", authenticate, myClaims);
router.post("/:itemId/claims", authenticate, createClaim);

module.exports = router;
