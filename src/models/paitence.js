const mongoose = require("mongoose");

const patienceschema = mongoose.Schema(
  {  
    fullname: {
      firstname: {
        type: String,
        required: true,
      },
      middlename: {
        type: String,
      },
      lastname: {
        type: String,
        required: true,
      },
    },

    phone: {
      type:String,
      required: true,
    },
    age:{
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const patiencemodel = mongoose.model("patience", patienceschema);

module.exports = patiencemodel;

