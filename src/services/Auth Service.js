const usermodel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const ALLOWED_DEPARTMENTS = [
  "Registration department",
  "Radiology department",
  "Billing department",
  "Reports department"
];

const register = async (req) => {

  const { email, password, name, role, department } = req.body;

  if (!email || !password || !name || !role) {
    throw new ApiError("Missing required fields", 400);
  }

  const admin = req.isAdmin === true;

  if (!admin && role === "ADMIN") {
    throw new ApiError("Only one Admin can register", 400);
  }

if (!admin && role !== "STAFF") {
  throw new ApiError("Only STAFF can be registered by admin", 400);
}


  if (role === "STAFF") {
    if (!department) {
      throw new ApiError("Department is required for STAFF", 400);
    }
    if (!ALLOWED_DEPARTMENTS.includes(department)) {
      throw new ApiError("Invalid department", 400);
    }
  }

  const user = await usermodel.findOne({ email });
  if (user) {
    throw new ApiError("User already exist", 400);
  }

  const hash = await bcrypt.hash(password, 10);

  
  

  const Newuser = await usermodel.create({
    name,
    email,
    password: hash,
    role,
    department: role === "STAFF" ? department : null
  });

  let token;
  if (Newuser.role === "ADMIN") {
    token = jwt.sign(
      {
        id: Newuser._id,
        role: Newuser.role,
        department: Newuser.department
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  }

  return {
    token,
    id: Newuser.id,
    name: Newuser.name,
    email: Newuser.email,
    role: Newuser.role,
    department: Newuser.department
  };
};

const login = async (req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError("Email and password required", 400);
  }

  const user = await usermodel.findOne({ email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  };
};

const profile = async (req) => {
  const userId = req.user._id;
  const user = await usermodel.findById(userId).select("-password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return user;
};

module.exports = { register, login, profile };
