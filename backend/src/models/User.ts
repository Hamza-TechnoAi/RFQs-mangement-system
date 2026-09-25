import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "member";
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function (candidate: string) { return bcrypt.compare(candidate, this.password); };
userSchema.set("toJSON", { transform: (_document, returned) => { Reflect.deleteProperty(returned, "password"); return returned; } });

export default mongoose.model<IUser>("User", userSchema);
