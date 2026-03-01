
const patientService = require('../services/patientService')
const Patient = require('../models/paitence')


const createPatientController = async (req, res, next) => {
  try {
    const result = await patientService.createPatient(req);

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {

    next(error);
  }
};

const getPatient = async (req, res, next) => {
  try {
    const result = await patientService.viewPatient(req.params.phone);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {

    next(error);
  }
};

const viewAllPatient = async (req, res, next) => {
  try {
    const result = await patientService.viewAllPatient();

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {

    next(error);
  }
};

const deletePatientController = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatientController,
  getPatient,
  viewAllPatient,
  deletePatientController
}
