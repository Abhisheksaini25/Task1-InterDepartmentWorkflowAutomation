const billingService =require("../services/billingService")

const pay = async (req, res, next) => {
  try {
    const result = await billingService.pay(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: result
    });
  
  } catch (error) {
    
    next(error);
  }
};

const getQueue = async (req, res, next) => {
  try {
    const result = await billingService.getQueue(req.user);

    res.status(200).json({
      success: true,
      data: result
    });
  
  } catch (error) {
    
    next(error);
  }
};

module.exports={
    pay,
    getQueue
}
