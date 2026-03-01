const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const dept = require("../middleware/departmentMidlleware");
const {
  approveController,
  completeController,
  getQueueController
} = require("../controllers/radiologyController");

router.patch("/requests/:id/approve", auth, dept("Radiology department"), approveController);
router.patch("/requests/:id/complete", auth, dept("Radiology department"), completeController);
router.get("/radiology/queue", auth, dept("Radiology department"), getQueueController);

module.exports = router;
