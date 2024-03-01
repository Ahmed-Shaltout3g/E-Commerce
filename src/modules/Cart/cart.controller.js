import { cartModel } from "../../../DB/Models/cart.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { ApiFeature } from "./../../utils/apiFeature.js";

// ======================add to cart============
export const addToCart = async (req, res, next) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;
  //   check about product
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("in_valid product Id", { cause: 400 }));
  }
  /**
   check if product is fressing or user add 
   quantity more than stock ad add him in wish list to 
   send notification if i add this product
  **/

  if (product.stock < quantity || product.isDeleted) {
    await productModel.findByIdAndUpdate(productId, {
      $addToSet: { userAddToWishList: userId },
    });
    return next(new Error("Not available", { cause: 400 }));
  }
  const cart = await cartModel.findOne({ userId }).lean();
  //   if user have cart
  if (cart) {
    // update
    let productFlag = false;
    let subTotal = 0;
    // update quantity if user add product not in cart we add it when flag is fasle
    for (const product of cart.products) {
      if (product.productId.toString() == productId) {
        product.quantity = quantity;
        productFlag = true;
      }
    }

    // add product if it ot found in cart
    if (!productFlag) {
      cart.products.push({ productId, quantity });
    }
    // update subTotal
    for (const product of cart.products) {
      const productExists = await productModel.findById(
        product.productId,
        "priceAfterDiscount"
      );
      subTotal += product.quantity * productExists.priceAfterDiscount || 0;
    }

    const cartUpdate = await cartModel.findOneAndUpdate(
      { userId },
      {
        subTotal,
        products: cart.products,
      },
      {
        new: true,
      }
    );
    return res.status(200).json({ message: "Done", cart: cartUpdate });
  }

  const subTotal = product.priceAfterDiscount * quantity;
  const cartObject = {
    userId,
    products: [{ productId, quantity }],
    subTotal,
  };
  const createCart = await cartModel.create(cartObject);
  req.failedDocument = { model: cartModel, _id: createCart._id };
  return res.status(201).json({ message: "Done", cart: createCart });
};

// ================delete from cart====================

export const deleteFromCart = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;
  const product = await productModel.findOne({
    _id: productId,
  });

  if (!product) {
    return next(new Error("invalid product ", { cause: 400 }));
  }

  const userCart = await cartModel.findOne({
    userId,
    "products.productId": productId,
  });
  if (!userCart) {
    return next(new Error("invalid cart", { cause: 400 }));
  }
  userCart.products.forEach((ele) => {
    if (ele.productId == productId) {
      userCart.products.splice(userCart.products.indexOf(ele), 1);
    }
  });
  let subTotal = 0;
  for (const product of userCart.products) {
    const productExists = await productModel.findById(
      product.productId,
      "priceAfterDiscount"
    );
    subTotal += product.quantity * productExists.priceAfterDiscount || 0;
  }
  userCart.subTotal = subTotal;

  await userCart.save();

  res.status(200).json({ message: "Done", userCart });
};

// ====================get all products in cart=========

export const getAllProductInCarts = async (req, res, next) => {
  const userId = req.user._id;

  const carts = await cartModel
    .find({ userId })
    .populate({
      path: "userId",
      select: "userName email",
    })
    .populate({
      path: "products.productId",
      select: "title price priceAfterDiscount desc quantity",
    });

  if (carts.length) {
    return res.status(200).json({
      message: "Done",
      data: carts,
    });
  }
  res.status(200).json({
    message: "No products in cart yet",
  });
};
