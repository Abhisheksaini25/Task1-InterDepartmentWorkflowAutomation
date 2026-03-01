const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patience",
      required: true
    },

    type: {
      type: String,
      required: true,
      enum: ["MRI"] 
    },
    
    steps: {
      type: [String],
      required: true
    },

    currentStep: {
      type: Number,
      default: 1
    },

    currentDepartment: {
      type: String,
      required: true,
      default:null
    },

    status: {
      type: String,
      enum: [
        "PENDING_APPROVAL",
        "APPROVED",
        "WAITING FOR PAY",
        "IN_PROGRESS",
        "COMPLETE/READY_FOR_REPORT",
        "REPORT_GENERATED",
        "CLOSED"
      ],
      default: "PENDING_APPROVAL"
    },

   
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING"
    },

    paymentAmount: {
      type: Number
    },

    paidAt: {
      type: Date
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usermodel"
    },

    
    reportText: {
      type: String
    },

    completedAt: {
      type: Date
    },

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usermodel"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request", requestSchema);
