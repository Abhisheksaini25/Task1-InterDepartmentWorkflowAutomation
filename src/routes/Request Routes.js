
const express=require('express')
const router=express.Router()
const authMiddleware=require("../middleware/authMiddleware")
const departmentMiddleware=require("../middleware/departmentMidlleware")
const {
   createRequestController,
  getAllRequestsController,
  getRequestByIdController,

} = require("../controllers/requestController");

router.post(
  "/Createrequests",
  authMiddleware,
  departmentMiddleware(["Registration department"]),
  createRequestController
)
router.get("/viewrequest",authMiddleware,getAllRequestsController)


router.get("/viewrequest/:id",authMiddleware,getRequestByIdController)


module.exports=router

