import { orderModel } from "../../../DB/Models/order.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { reviewModel } from "../../../DB/Models/review.model.js";

// ======================add Review =========================
export const addReview = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.query;
  const { reviewRate, reviewComment } = req.body;
  // --------------check product is valid------------
  const isProductValidToBeReview = await orderModel.findOne({
    userId,
    "products.productId": productId,
    orderStatus: "delivered",
  });
  console.log();
  if (!isProductValidToBeReview) {
    return next(
      new Error(
        "you should buy this product first and order status is delivered  to make review ",
        {
          cause: 404,
        }
      )
    );
  }

  const reviewObject = {
    userId,
    productId,
    reviewRate,
    reviewComment,
  };
  const reviewDB = await reviewModel.create(reviewObject);
  if (!reviewDB) {
    return next(
      new Error("Fail to add review please try again ", {
        cause: 500,
      })
    );
  }
  //   --------------------culc review for product ----------

  const product = await productModel.findById(productId);
  const reviews = await reviewModel.find({ productId });
  let sumRates = 0;
  for (const review of reviews) {
    sumRates += review.reviewRate;
  }
  product.rate = Number(sumRates / reviews.length).toFixed(2);
  await product.save();

  res.status(201).json({ message: "Done", reviewDB, product });
};
