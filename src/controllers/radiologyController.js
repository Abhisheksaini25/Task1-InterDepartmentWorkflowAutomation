const radiologyService = require("../services/radiologyService");

const approveController = async (req, res, next) => {
  try {
    const result = await radiologyService.approve(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const completeController = async (req, res, next) => {
  try {
    const result = await radiologyService.complete(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getQueueController = async (req, res, next) => {
  try {
    const result = await radiologyService.getQueue(req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  approveController,
  completeController,
  getQueueController
};