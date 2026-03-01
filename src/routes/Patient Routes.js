const express = require('express')
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const departmentMiddleware = require("../middleware/departmentMidlleware")
const { createPatientController, getPatient, viewAllPatient, deletePatientController } = require("../controllers/patientController")





router.post(
  "/Createpatients",
  authMiddleware,
  departmentMiddleware(["Registration department"]),
  createPatientController
)

router.get(
  "/viewpatients/phone/:phone",
  authMiddleware,
  departmentMiddleware(["Registration department"]),
  getPatient
);



router.get(
  "/viewpatients",
  authMiddleware,
  departmentMiddleware([
    "Registration department",
  ]),
  viewAllPatient
)

// Admin only: delete patient
router.delete(
  "/patient/:id",
  authMiddleware,
  deletePatientController
)

module.exports = router
