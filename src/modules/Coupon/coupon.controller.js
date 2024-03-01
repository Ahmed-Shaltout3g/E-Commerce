import { couponModel } from "../../../DB/Models/coupon.model.js";
import { ApiFeature } from "../../utils/apiFeature.js";
import { userModel } from "./../../../DB/Models/user.model.js";

export const createCoupon = async (req, res, next) => {
  const {
    couponCode,
    couponAmount,
    isPrecentage,
    isFixedAmount,
    fromDate,
    toDate,
    couponAssginedToUser,
  } = req.body;
  const { _id } = req.user;

  const isCodeDublicated = await couponModel.findOne({ couponCode });
  if (isCodeDublicated) {
    return next(new Error("Coupon Code Is Duplicated", { cause: 404 }));
  }

  if ((isPrecentage && isFixedAmount) || (!isPrecentage && !isFixedAmount)) {
    return next(
      new Error("please enter Precentage OR Fixed Amount", { cause: 404 })
    );
  }
  let usersArr = [];
  for (const user of couponAssginedToUser) {
    usersArr.push(user.userId);
  }
  const checkDB = await userModel.find({ _id: { $in: usersArr } });
  if (checkDB.length != usersArr.length) {
    const idsError = usersArr.filter((item) => !checkDB.includes(item));
    return next(new Error(`In_Valid Users Ids the ids Error :   ${idsError}`), {
      cause: 400,
    });
  }

  const couponObject = {
    couponCode,
    couponAmount,
    isPrecentage,
    isFixedAmount,
    fromDate,
    toDate,
    createdBy: _id,
    couponAssginedToUser,
  };
  const createCoupon = await couponModel.create(couponObject);
  req.failedDocument = { model: couponModel, _id: createCoupon._id };
  if (!createCoupon) {
    return next(new Error("fail please try again", { cause: 500 }));
  }
  res.status(201).json({
    message: "Done",
    coupon: createCoupon,
  });
};

// ===================update coupon ===================

export const updateCoupon = async (req, res, next) => {
  const { _id } = req.user;
  const { couponId } = req.query;
  const { couponCode, couponAmount, fromDate, toDate } = req.body;

  const coupon = await couponModel.findById(couponId);
  if (!coupon) {
    return next(new Error("invalid coupon id ", { cause: 404 }));
  }
  if (couponCode) {
    // new category couponCode not same old couponCode
    if (couponCode.toLowerCase() == coupon.couponCode) {
      return next(
        new Error(
          "new couponCode same old couponCode please enter anothe couponCode ",
          {
            cause: 404,
          }
        )
      );
    }

    // new couponCode not dublicated

    const isDublicated = await couponModel.findOne({ couponCode });
    if (isDublicated) {
      return next(new Error("coupon couponCode is duplicated", { cause: 404 }));
    }

    coupon.couponCode = couponCode;
  }
  if (couponAmount) coupon.couponAmount = couponAmount;
  if (fromDate) coupon.fromDate = fromDate;
  if (toDate) coupon.toDate = toDate;
  coupon.updatedBy = _id;
  const saveChanged = await coupon.save();

  if (!saveChanged) {
    return next(new Error("fail", { cause: 500 }));
  }
  res.status(200).json({
    message: "Done",
    coupon,
  });
};

// =================delete coupon=============

export const deleteCoupon = async (req, res, next) => {
  const { couponId } = req.query;
  const { _id } = req.user;
  const coupon = await couponModel.findOneAndDelete({
    _id: couponId,
    createdBy: _id,
  });
  if (!coupon) {
    return next(new Error("invalid coupon id ", { cause: 404 }));
  }
  res.status(200).json({
    message: "Done",
  });
};

// ====================get all coupon=============
// export const getAllCoupon = async (req, res, next) => {
//   const coupons = await couponModel
//     .find()
//     .populate({
//       path: "couponAssginedToUser.userId",
//       select: "userName email",
//     })
//     .populate({
//       path: "updatedBy",
//       select: "userName email",
//     })
//     .populate({
//       path: "createdBy",
//       select: "userName email",
//     });

//   if (coupons.length) {
//     return res.status(200).json({
//       message: "Done",
//       coupons,
//     });
//   }
//   res.status(200).json({
//     message: "No coupons",
//   });
// };

export const getAllCoupon = async (req, res, next) => {
  const apiFeaturesInistant = new ApiFeature(couponModel.find(), req.query)
    .paginated()
    .sort()
    .select()
    .filters()
    .search();

  const coupons = await apiFeaturesInistant.mongooseQuery
    .populate({
      path: "couponAssginedToUser.userId",
      select: "userName email",
    })
    .populate({
      path: "updatedBy",
      select: "userName email",
    })
    .populate({
      path: "createdBy",
      select: "userName email",
    });
  const paginationInfo = await apiFeaturesInistant.paginationInfo;
  const all = await couponModel.find().count();
  const totalPages = Math.ceil(all / paginationInfo.perPages);
  paginationInfo.totalPages = totalPages;
  if (coupons.length) {
    return res.status(200).json({
      message: "Done",
      data: coupons,
      paginationInfo,
    });
  }
  res.status(200).json({
    message: "No Coupons yet",
  });
};
