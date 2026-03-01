const Patient = require("../models/paitence");
const ApiError = require("../utils/ApiError");

const createPatient = async (req) => {
  const body = req.body || {};
  const fullname = body.fullname || {};
  const firstname = fullname.firstname || body.firstname;
  const middlename = fullname.middlename || body.middlename;
  const lastname = fullname.lastname || body.lastname;
  const phone = body.phone;
  const age = body.age;
  const gender = body.gender;

  if (
    !firstname ||
    !lastname ||
    phone === undefined ||
    phone === null ||
    age === undefined ||
    age === null ||
    !gender
  ) {
    throw new ApiError("Required fields missing", 400);
  }

  const existing = await Patient.findOne({ phone });
  if (existing) return existing;

  const newPatient = await Patient.create({
    fullname: {
      firstname,
      middlename,
      lastname
    },
    phone,
    age,
    gender
  });

  return newPatient;
};

const viewPatient = async (phone) => {
  const patient = await Patient.findOne({ phone });
  if (!patient) throw new ApiError("Patient not found", 404);
  return patient;
};


const viewAllPatient = async () => {
  const patients = await Patient.find();

  if (patients.length === 0) {
    throw new ApiError("No patients found", 404);
  }

  return patients;
};


module.exports={
    createPatient,
    viewPatient,
    viewAllPatient 
}

