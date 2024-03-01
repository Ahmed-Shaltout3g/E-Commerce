import { Schema, model } from "mongoose";
import { systemRoles } from "./../../src/utils/systemRoles.js";
import { hashingPassword } from "../../src/utils/hashing.js";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      trim: true,
      required: [true, "userName is required"],
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      unique: [true, "Email is unique"],
      required: [true, "Email is required"],
      lowercase: true,
    },
    address: [
      {
        type: String,
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    age: {
      type: Number,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    profileImage: {
      secure_url: String,
      public_id: String,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      default: systemRoles.USER,
      enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    },
    gender: {
      type: String,
      default: "Not Specifid",
      enum: ["male", "female"],
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },

    isLogedIn: {
      type: Boolean,
      default: false,
    },
    code: {
      type: String,
      default: null,
    },
    changePassAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", function (next, doc) {
  this.password = hashingPassword(
    this.password,
    parseInt(process.env.SOLT_ROUNDS)
  );
  next();
});
export const userModel = model.User || model("User", userSchema);
