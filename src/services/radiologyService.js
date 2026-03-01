const Request = require("../models/Request");
const historyService = require("./historyService");
const ApiError = require("../utils/ApiError");

const toQueueResponse = (request) => ({
  _id: request._id,
  patientId: request.patientId,
  type: request.type,
  status: request.status
});

const approve = async (id, user) => {

  const request = await Request.findById(id);
  if (!request) throw new Error("Request not found");

  if (request.status !== "PENDING_APPROVAL")
    throw new Error("Invalid status");

  request.status = "APPROVED";
  request.currentStep += 1;
  request.currentDepartment = request.steps[request.currentStep];

  await request.save();

  await historyService.logHistory(
    request._id,
    user.department || "Admin",
    "APPROVED",
    request.status,
    user._id
  );

  return toQueueResponse(request);
};

const complete = async (id, user) => {

  const request = await Request.findById(id);
  if (!request) throw new ApiError("Request not found", 404);

  if (request.paymentStatus !== "PAID") {
    throw new ApiError(
      "Billing is not completed. Payment must be Pending ",
      400
    );
  }

  request.status = "COMPLETE/READY_FOR_REPORT";
  request.currentStep += 1;
  request.currentDepartment = request.steps[request.currentStep];

  await request.save();

  await historyService.logHistory(
    request._id,
    user.department || "Admin",
    "SERVICE_COMPLETED",
    request.status,
    user._id
  );

  return toQueueResponse(request);
};

const getQueue = async (user) => {
  return await Request.find({
    type: "MRI",
    status: { $ne: "CLOSED" }
  }).select("_id patientId type status paymentStatus paidBy paidAt  ");
};


module.exports = { approve, complete, getQueue };
