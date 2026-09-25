import mongoose, { Schema, Document } from "mongoose";

export type RFQStatus =
  | "Pending"
  | "Waiting Supplier Quotation"
  | "Submitted";

export interface IRFQ extends Document {
  rfqNumber: string;
  rfqDate: Date;
  customer: string;
  contactPerson: string;
  email: string;
  subject: string;
  assignedTo: mongoose.Types.ObjectId;
  status: RFQStatus;
  submissionDate?: Date;
  preparedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const rfqSchema = new Schema<IRFQ>(
  {
    rfqNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    rfqDate: {
      type: Date,
      required: true
    },

    customer: {
      type: String,
      required: true,
      trim: true
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Waiting Supplier Quotation",
        "Submitted"
      ],
      default: "Pending"
    },

    submissionDate: {
      type: Date
    },

    preparedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

rfqSchema.pre("validate", function () {
  if (this.status === "Submitted" && (!this.submissionDate || !this.preparedBy)) this.invalidate("status", "Submission Date and Prepared By are required when status is Submitted");
  if (this.status !== "Submitted") { this.submissionDate = undefined; this.preparedBy = undefined; }
});

export default mongoose.model<IRFQ>("RFQ", rfqSchema);
