import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          required: true,
        },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
      },
    ],
    subTotal: {
      type: Number,
      default: 0,
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    paidAmount: { type: Number, default: 0, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: [String], required: true },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "placed",
        "on way",
        "delivered",
        "canceled",
        "rejected",
      ],
    },
    reason: String,
    paymentMethod: {
      type: String,
      default: "cash",
      enum: ["cash", "card"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    canceledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const orderModel = model.Order || model("Order", orderSchema);
