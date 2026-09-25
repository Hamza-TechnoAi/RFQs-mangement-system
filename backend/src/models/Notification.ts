import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  rfq?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  rfq: { type: Schema.Types.ObjectId, ref: "RFQ" },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export default mongoose.model<INotification>("Notification", notificationSchema);
