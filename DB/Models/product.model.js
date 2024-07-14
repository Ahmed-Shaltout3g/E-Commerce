import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    // ================text section===============
    title: {
      type: String,
      trim: true,
      required: true,
      lowerCase: true,
    },
    slug: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
    // ==============price section ===============
    price: {
      type: Number,
      default: 0,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    priceAfterDiscount: {
      type: Number,
      default: 0,
      required: true,
    },
    // =================quantity section==================
    stock: {
      type: Number,
      default: 0,
      required: true,
    },

    // ===============images section================
    Images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    // =================ids section ===============
    customId: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    //  ============= specifiction section========
    colors: [String],
    size: [String],
    // to field
    isDeleted: {
      type: Boolean,
      default: false,
    },
    userAddToWishList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Uesr",
      },
    ],

    // =================review===================
    rate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("Reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
});
export const productModel = model.Product || model("Product", productSchema);
