import { Schema, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    logo: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    customId: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Uesr",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

brandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brandId",
});

export const brandModel = model.Brand || model("Brand", brandSchema);
