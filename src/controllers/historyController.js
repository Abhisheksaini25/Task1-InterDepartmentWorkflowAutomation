const historyService = require("../services/historyService");
const Request = require("../models/Request");
const ApiError = require("../utils/ApiError");

const getHistoryController = async (req, res, next) => {

  try {
    if (!req.params.id) {
      throw new ApiError("Request id is required", 400);
    }

    // First try as Request ID
    let result = await historyService.getHistoryByRequest(req.params.id);

    // If empty, try as Patient ID (find all requests for this patient, then get history)
    if (!result || result.length === 0) {
      const requests = await Request.find({ patientId: req.params.id }).select("_id");
      if (requests.length > 0) {
        const requestIds = requests.map(r => r._id);
        result = await historyService.getHistoryByMultipleRequests(requestIds);
      }
    }

    res.status(200).json({
      success: true,
      data: result || []
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getHistoryController };
