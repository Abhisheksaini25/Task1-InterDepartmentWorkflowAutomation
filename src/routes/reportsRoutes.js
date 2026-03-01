const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const dept = require("../middleware/departmentMidlleware");
const {
  generateReportController,
  getQueueController,
  closeRequestController
} = require("../controllers/reportController");

router.patch("/requests/:id/report", auth, dept("Reports department"),generateReportController);
router.patch("/requests/:id/close", auth, dept("Reports department"), closeRequestController);
router.get("/reports/queue", auth, dept("Reports department"), getQueueController);

module.exports = router;
