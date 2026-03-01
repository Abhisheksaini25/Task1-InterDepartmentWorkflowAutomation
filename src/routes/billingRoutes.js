const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const dept = require("../middleware/departmentMidlleware");
const { pay, getQueue } = require("../controllers/billingController");

router.patch("/requests/:id/pay", auth, dept("Billing department"),pay);
router.get("/billing/queue", auth, dept("Billing department"),getQueue);

module.exports = router;