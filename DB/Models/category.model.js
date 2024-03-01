import { Schema, model } from "mongoose";

const categorySchema = new Schema(
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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual("subCategory", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "categoryId",
});

categorySchema.virtual("Brands", {
  ref: "brand",
  localField: "_id",
  foreignField: "categoryId",
});

export const categoryModel =
  model.Category || model("Category", categorySchema);
