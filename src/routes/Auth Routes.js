const express = require('express')
const router = express.Router()
const { profileController, registerController, loginController, logoutController, getAllStaffController, updateStaffController, deleteStaffController } = require('../controllers/authController')
const AuthMiddleware = require('../middleware/authMiddleware')
const Admin = require('../middleware/AdminMiddleware')


router.post("/register", Admin, registerController);
router.post("/login", loginController)
router.post("/logout", AuthMiddleware, logoutController)
router.get("/me", AuthMiddleware, profileController)

// Staff management (admin only)
router.get("/staff", AuthMiddleware, getAllStaffController)
router.put("/staff/:id", AuthMiddleware, updateStaffController)
router.delete("/staff/:id", AuthMiddleware, deleteStaffController)

module.exports = router;
