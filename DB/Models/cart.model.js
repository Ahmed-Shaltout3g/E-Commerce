import { Schema, model } from "mongoose";

const cartSchema = new Schema(
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
      },
    ],

    subTotal: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true }
);

export const cartModel = model.Cart || model("Cart", cartSchema);
