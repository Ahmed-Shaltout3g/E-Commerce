import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

subCategorySchema.virtual("Brand", {
  ref: "Brand",
  localField: "_id",
  foreignField: "subCategoryId",
});

export const subCategoryModel =
  model.SubCategory || model("SubCategory", subCategorySchema);
