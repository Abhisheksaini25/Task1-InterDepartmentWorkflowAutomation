const reportsService=require("../services/reportsService")
const generateReportController = async (req, res, next) => {
  try {
    const result = await reportsService.generateReport(
      req.params.id,
  
      req.user
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getQueueController = async (req, res, next) => {
  try {
    const result = await reportsService.getQueue(req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const closeRequestController = async (req, res, next) => {
  try {
    const result = await reportsService.closeRequest(req.params.id, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports={
  getQueueController,
  generateReportController,
  closeRequestController
}
