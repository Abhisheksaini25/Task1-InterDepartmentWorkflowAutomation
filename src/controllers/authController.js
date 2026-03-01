const authService = require('../services/Auth Service')
const userModel = require('../models/user')


const registerController = async (req, res, next) => {
  try {
    const result = await authService.register(req);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {

    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    const result = await authService.login(req);

    res.status(200).json({
      success: true,
      data: result
    });



  } catch (error) {
    next(error);
  }
};


const logoutController = async (req, res, next) => {
  try {

    // here not need to logout because we not using frontend 

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    next(error);
  }
};

const profileController = async (req, res, next) => {
  try {
    const result = await authService.profile(req);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
};

// ===== STAFF MANAGEMENT (Admin only) =====
const getAllStaffController = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const users = await userModel.find().select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateStaffController = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const { name, email, department } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (department) updateData.department = department;

    const updated = await userModel.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteStaffController = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    // Prevent admin from deleting themselves
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }
    const deleted = await userModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  profileController,
  getAllStaffController,
  updateStaffController,
  deleteStaffController
};
