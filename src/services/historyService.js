const RequestHistory = require("../models/RequestHistory");

const logHistory = async (
  requestId,
  department,
  action,
  status,
  userId
) => {

  await RequestHistory.create({
    requestId,
    department,
    action,
    status,
    updatedBy: userId
  });
};

const getHistoryByRequest = async (requestId) => {

  return await RequestHistory.find({ requestId })
    .populate("updatedBy", "name email")
    .sort({ createdAt: 1 });
};

const getHistoryByMultipleRequests = async (requestIds) => {
  return await RequestHistory.find({ requestId: { $in: requestIds } })
    .populate("updatedBy", "name email")
    .sort({ createdAt: 1 });
};

module.exports = {
  logHistory,
  getHistoryByRequest,
  getHistoryByMultipleRequests
};