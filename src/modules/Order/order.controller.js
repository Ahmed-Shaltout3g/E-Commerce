import { nanoid } from "nanoid";
import { couponModel } from "../../../DB/Models/coupon.model.js";
import { orderModel } from "../../../DB/Models/order.model.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { couponFunctionValidation } from "../../utils/coupon.validation.js";
import { cartModel } from "./../../../DB/Models/cart.model.js";
import createInvoice from "../../utils/pdfkit.js";
import { sendEmail } from "../../services/sendEmail.js";

export const createOrder = async (req, res, next) => {
  const userId = req.user._id;
  const {
    productId,
    quantity,
    address,
    phoneNumber,
    paymentMethod,
    couponCode,
  } = req.body;
  // ===============check if coupon valid==============
  if (couponCode) {
    const coupon = await couponModel.findOne({ couponCode });
    if (!coupon) {
      return next(
        new Error("in_valid Coupon Code, please enter a valid coupon ", {
          cause: 404,
        })
      );
    }
    const { expired, matched, exceed, expiredNotStart } =
      couponFunctionValidation({ coupon, userId });
    console.log({ expired, matched, exceed, expiredNotStart });
    if (!matched) {
      return next(new Error("this coupon not assgined to you", { cause: 404 }));
    }
    if (expired) {
      return next(new Error("this coupon is expired", { cause: 404 }));
    }
    if (exceed) {
      return next(
        new Error("you exceed the max usage of this coupon", { cause: 404 })
      );
    }
    if (expiredNotStart) {
      return next(new Error("this coupon is not started yet", { cause: 404 }));
    }

    req.coupon = coupon;
  }
  //  ============ products validation====================
  let products = [];
  const findProduct = await productModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });
  if (!findProduct) {
    return next(
      new Error("in_valid product please check your quantity", { cause: 400 })
    );
  }

  const productObject = {
    productId,
    quantity,
    title: findProduct.title,
    price: findProduct.priceAfterDiscount,
    finalPrice: Number.parseFloat(
      findProduct.priceAfterDiscount * quantity
    ).toFixed(2),
  };

  products.push(productObject);
  //   ============sub total ===========
  let subTotal = productObject.finalPrice;

  //   ===========paidAmount============
  if (
    req.coupon?.isFixedAmount &&
    req.coupon?.couponAmount > findProduct.priceAfterDiscount
  ) {
    return next(
      new Error("please select another product price less than coupon amount", {
        cause: 400,
      })
    );
  }
  let paidAmount = 0;
  // if i have coupon check it is percentage pr fixed
  if (req.coupon?.isPrecentage) {
    paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100);
  } else if (req.coupon?.isFixedAmount) {
    paidAmount = subTotal - req.coupon.couponAmount;
  } else {
    paidAmount = subTotal;
  }

  //   ==============paymentMethod=============
  let orderStatus;
  paymentMethod == "cash"
    ? (orderStatus = "placed")
    : (orderStatus = "pending");

  // final Object

  const orderObject = {
    userId,
    products,
    address,
    phoneNumber,
    orderStatus,
    paymentMethod,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
  };
  const order = await orderModel.create(orderObject);
  req.failedDocument = { model: orderModel, _id: order._id };
  if (!order) {
    return next(new Error("DB fail, please try again", { cause: 500 }));
  }
  //======================== create invoice pdf==================================
  const orderCode = `${req.user.userName}_${nanoid(3)}`;
  const orderInvoice = {
    items: order.products,
    subTotal: order.subTotal,
    paidAmount: order.paidAmount,
    orderCode,
    date: order.createdAt,
    shipping: {
      name: `${req.user.userName}`,
      state: `${order.address}`,
      city: `${order.address}`,
      country: "Egypt",
      address: `${order.address}`,
    },
  };
  await createInvoice(orderInvoice, `${orderCode}.pdf`);
  const emailSent = await sendEmail({
    to: req.user.email,
    subject: "Confirmation order",
    message: "<h1>please find your invoice pdf below</h1>",
    attachments: [
      {
        path: `./Files/${orderCode}.pdf`,
      },
    ],
  });
  // decrease products stock by quantity

  await productModel.findOneAndUpdate(
    { _id: productId },
    {
      $inc: { stock: -parseInt(quantity) },
    }
  );

  // increase coupon Usage
  if (req.coupon) {
    for (const user of req.coupon?.couponAssginedToUser) {
      if (user.userId.toString() == userId.toString()) {
        user.usageCount += 1;
      }
    }
    await req.coupon.save();
  }
  //  TODO remove product from cart
  const userCart = await cartModel.findOne({
    userId,
    "products.productId": productId,
  });
  if (userCart) {
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
  }

  res.status(201).json({ message: "Done", order });
};

// ================= create order from cart===================
export const fromCartToOrde = async (req, res, next) => {
  const { cartId } = req.query;
  const userId = req.user._id;

  const { paymentMethod, address, phoneNumber, couponCode } = req.body;
  const cart = await cartModel.findById(cartId);
  if (!cart || !cart.products.length) {
    return next(new Error("please add products to your cart", { cause: 400 }));
  }
  //=================== couponCode check ==============
  if (couponCode) {
    const coupon = await couponModel.findOne({ couponCode });
    if (!coupon) {
      return next(
        new Error("in_valid Coupon Code, please enter a valid coupon ", {
          cause: 404,
        })
      );
    }
    const { expired, matched, exceed, expiredNotStart } =
      couponFunctionValidation({ coupon, userId });
    console.log({ expired, matched, exceed, expiredNotStart });
    if (!matched) {
      return next(new Error("this coupon not assgined to you", { cause: 404 }));
    }
    if (expired) {
      return next(new Error("this coupon is expired", { cause: 404 }));
    }
    if (exceed) {
      return next(
        new Error("you exceed the max usage of this coupon", { cause: 404 })
      );
    }
    if (expiredNotStart) {
      return next(new Error("this coupon is not started yet", { cause: 404 }));
    }

    req.coupon = coupon;
  }

  //=============== products=================
  let products = [];
  let productsIds = [];
  for (const product of cart.products) {
    productsIds.push(product.productId);
    const productExist = await productModel.findById(product.productId);
    products.push({
      productId: product.productId,
      quantity: product.quantity,
      title: productExist.title,
      price: productExist.priceAfterDiscount,
      finalPrice: productExist.priceAfterDiscount * product.quantity,
    });
  }

  //=============== subTotal ==============
  const subTotal = cart.subTotal;

  //===================== paidAmount ================
  if (req.coupon?.isFixedAmount && req.coupon?.couponAmount > subTotal) {
    return next(
      new Error(
        "please select another products price less than coupon amount",
        {
          cause: 400,
        }
      )
    );
  }
  let paidAmount = 0;
  // if i have coupon check it is percentage pr fixed
  if (req.coupon?.isPrecentage) {
    paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100);
  } else if (req.coupon?.isFixedAmount) {
    paidAmount = subTotal - req.coupon.couponAmount;
  } else {
    paidAmount = subTotal;
  }

  //===================== orderStatus + paymentMethod ================
  let orderStatus;
  paymentMethod == "cash"
    ? (orderStatus = "placed")
    : (orderStatus = "pending");

  const orderObject = {
    userId,
    products,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
    address,
    phoneNumber,
    paymentMethod,
    orderStatus,
  };

  const orderDB = await orderModel.create(orderObject);
  req.failedDocument = { model: orderModel, _id: orderDB._id };

  if (!orderDB) {
    return next(new Error("fail to order"));
  }

  //======================== create invoice pdf==================================
  const orderCode = `${req.user.userName}_${nanoid(3)}`;
  const orderInvoice = {
    items: orderDB.products,
    subTotal: orderDB.subTotal,
    paidAmount: orderDB.paidAmount,
    orderCode,
    date: orderDB.createdAt,
    shipping: {
      name: `${req.user.userName}`,
      state: `${orderDB.address}`,
      city: `${orderDB.address}`,
      country: "Egypt",
      address: `${orderDB.address}`,
    },
  };
  await createInvoice(orderInvoice, `${orderCode}.pdf`);
  const emailSent = await sendEmail({
    to: req.user.email,
    subject: "Confirmation order",
    message: "<h1>please find your invoice pdf below</h1>",
    attachments: [
      {
        path: `./Files/${orderCode}.pdf`,
      },
    ],
  });

  // decrease products stock by quantity
  for (const product of cart.products) {
    await productModel.findOneAndUpdate(
      { _id: product.productId },
      {
        $inc: { stock: -parseInt(product.quantity) },
      }
    );
  }
  // increase coupon Usage
  if (req.coupon) {
    for (const user of req.coupon?.couponAssginedToUser) {
      if (user.userId.toString() == userId.toString()) {
        user.usageCount += 1;
      }
    }
    await req.coupon.save();
  }
  // delete products in cart
  const updateCart = await cartModel.updateOne(
    { userId },
    {
      $pull: { products: { productId: { $in: productsIds } } },
    }
  );
  if (updateCart.modifiedCount) {
    await cartModel.updateOne(
      { userId },
      {
        subTotal: 0,
      }
    );
  }
  res.status(201).json({ message: "Done", orderDB });
};

// ==================cancel order====================

export const cancelOrder = async (req, res, next) => {
  const { _id } = req.user;
  const { orderId } = req.query;
  const { reason } = req.body;
  const order = await orderModel.findById(orderId);
  if (!order) {
    next(new Error("in_valid order Id,  ", { cause: 404 }));
  }
  if (
    (order.orderStatus != "placed" && order.paymentMethod == "cash") ||
    (!["confirmed", "pending"].includes(order.orderStatus) &&
      order.paymentMethod == "card")
  ) {
    next(
      new Error(
        `you canot cancel this order with order status ${order.orderStatus}`,
        { cause: 404 }
      )
    );
  }
  order.orderStatus = "canceled";
  order.reason = reason;
  order.updatedBy = _id;
  const orderCanceled = await order.save();
  //  decrease coupon Usage

  if (orderCanceled) {
    console.log(order);
    if (order.couponId) {
      const coupon = await couponModel.findById(order.couponId);
      if (!coupon) {
        return next(
          new Error("in_valid Coupon Code, please enter a valid coupon ", {
            cause: 404,
          })
        );
      }

      coupon.couponAssginedToUser.map((ele) => {
        if (order.userId.toString() == ele.userId.toString()) {
          ele.usageCount -= 1;
        }
      });
      await coupon.save();
    }
  }
  // increase products stock by quantity
  for (const product of order.products) {
    await productModel.findOneAndUpdate(
      { _id: product.productId },
      {
        $inc: { stock: parseInt(product.quantity) },
      }
    );
  }

  res.status(200).json({ message: "Done order canceled successfulLy" });
};

// ================================ mark teh order as delivered ===================
export const deliverOrder = async (req, res, next) => {
  const { orderId } = req.query;

  const order = await orderModel.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $nin: ["delivered", "pending", "canceled", "rejected"] },
    },
    {
      orderStatus: "delivered",
    },
    {
      new: true,
    }
  );

  if (!order) {
    return next(new Error("invalid order", { cause: 400 }));
  }

  return res.status(200).json({ message: "Done", order });
};
