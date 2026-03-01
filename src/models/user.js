
const mongoose = require("mongoose");


const userschema = mongoose.Schema(
  {
    email: {
      type: String,
      unique:true
    },
    
    name:{
       type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
  type: String,
  enum: ["ADMIN", "STAFF"],
  required: true
},

department: {
  type: String,
  enum: ["Registration department", "Radiology department", "Billing department", "Reports department"],
  required: function () {
    return this.role === "STAFF";
  }
}
  },

  {
    timestamps: true,
  },
);

const usermodel = mongoose.model("usermodel", userschema);

module.exports = usermodel;
