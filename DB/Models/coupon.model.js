import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    couponCode: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    couponAmount: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 1,
    },
    isPrecentage: {
      type: Boolean,
      required: true,
      default: false,
    },
    isFixedAmount: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    couponAssginedToUser: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        maxUsage: {
          type: Number,
          required: true,
        },
        usageCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    couponAssginedToProduct: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    fromDate: {
      type: String,
      required: true,
    },
    toDate: {
      type: String,
      required: true,
    },
    couponStatus: {
      type: String,
      required: true,
      enum: ["Expired", "Valid"],
      default: "Valid",
    },
  },
  { timestamps: true }
);

export const couponModel = model.Coupon || model("Coupon", couponSchema);
