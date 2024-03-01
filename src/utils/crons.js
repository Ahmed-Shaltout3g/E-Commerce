import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { couponModel } from "./../../DB/Models/coupon.model.js";

export const changeCouponStatus = async () => {
  scheduleJob('0 * * * *', async function () {
    const coupons = await couponModel.find({ couponStatus: "Valid" });
    for (const coupon of coupons) {
      if (
        moment(coupon.toDate)
          .tz("Africa/Cairo")
          .isBefore(moment().tz("Africa/Cairo"))
      ) {
        coupon.couponStatus = "Expired";
      }
      await coupon.save();
    }
    console.log(" cron job changeCouponStatus is running .....");
  });
};

export const deleteCouponExpired = async () => {
  scheduleJob('0 0 */10 * *', async function () {
    const coupons = await couponModel.findOneAndDelete({
      couponStatus: "Expired",
    });

    console.log(" cron job deleteCouponExpried is running .....");
  });
};
