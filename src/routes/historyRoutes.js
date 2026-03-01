const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getHistoryController } = require("../controllers/historyController");

router.get("/requests/:id/history", authMiddleware, getHistoryController);

module.exports = router;


