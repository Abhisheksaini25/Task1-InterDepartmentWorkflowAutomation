const Request = require("../models/Request");
const historyService = require("./historyService");
const ApiError = require("../utils/ApiError");

const toRequestSummary = (request) => ({
  _id: request._id,
  patientId: request.patientId,
  type: request.type,
  currentDepartment: request.currentDepartment,
  status: request.status,
  paymentStatus: request.paymentStatus
});

const generateReport = async (id, user) => {
  const request = await Request.findById(id).populate("patientId").select("-steps -currentStep");
  if (!request) throw new ApiError("Request not found", 404);

  if (request.status === "REPORT_GENERATED") {
    throw new ApiError("Report already generated", 400);
  }

  if (request.status !== "COMPLETE/READY_FOR_REPORT") {
    throw new ApiError("Request is not ready for report", 400);
  }

  // Generate random pass/fail result (true 50/50)
  const reportResult = Math.random() < 0.5 ? "PASS" : "FAIL";

  request.status = "REPORT_GENERATED";
  request.currentDepartment = user.department || "Reports department";
  request.reportText = `Result: ${reportResult} | Generated on ${new Date().toLocaleString()} | By: ${user.department || 'Admin'}`;
  await request.save();

  await historyService.logHistory(
    request._id,
    user.department || "Admin",
    "REPORT_GENERATED",
    request.status,
    user._id
  );

  return {
    ...toRequestSummary(request),
    patient: request.patientId,
    reportResult,
    reportText: request.reportText
  };
};




const getQueue = async (user) => {
  return await Request.find({
    status: { $in: ["COMPLETE/READY_FOR_REPORT", "REPORT_GENERATED"] }
  }).select("_id patientId type status paymentStatus");
};

const closeRequest = async (id, user) => {
  const request = await Request.findById(id).select("-steps -currentStep");
  if (!request) throw new ApiError("Request not found", 404);

  if (request.status === "CLOSED") {
    throw new ApiError("Request already closed", 400);
  }

  if (request.status !== "REPORT_GENERATED") {
    throw new ApiError("Only REPORT_GENERATED request can be closed", 400);
  }

  request.status = "CLOSED";

  await request.save();

  await historyService.logHistory(
    request._id,
    user.department || "Admin",
    "CLOSED",
    request.status,
    user._id
  );

  return toRequestSummary(request);
};

module.exports = { generateReport, getQueue, closeRequest };
