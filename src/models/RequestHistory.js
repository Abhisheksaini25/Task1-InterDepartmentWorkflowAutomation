const mongoose = require("mongoose");

const requestHistorySchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true
    },

    department: {
      type: String,
      required: true
    },

    action: {
      type: String,
      required: true
    },

    status: {
      type: String,
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usermodel",
      required: true
    }
  },
  {
    timestamps: true 
  }
);

module.exports = mongoose.model("RequestHistory", requestHistorySchema);
