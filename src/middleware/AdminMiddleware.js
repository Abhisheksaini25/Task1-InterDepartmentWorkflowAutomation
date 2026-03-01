const userModel = require("../models/user");
const AuthMiddleware = require("./authMiddleware");

const AdminMiddleware = async (req, res, next) => {
  try {
    const usersCount = await userModel.countDocuments();

   
    if (usersCount === 0) {
      req.isAdmin = true;
      return next();
    }

    if (usersCount === 1 ) {
      req.isAdmin = false;
      return next();
    }

    return AuthMiddleware(req, res, () => {
      if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Only admin can register Staff"
        });
      }
      next();
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = AdminMiddleware;
