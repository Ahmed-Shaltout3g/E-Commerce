import moment from "moment-timezone";

export const couponFunctionValidation = ({ coupon, userId } = {}) => {
  let expired = false;
  let matched = false;
  let exceed = false;
  let expiredNotStart = false;

  // expired
  if (
    coupon.couponStatus == "Expired" ||
    moment(coupon.toDate).isBefore(moment().tz("Africa/Cairo"))
  ) {
    expired = true;
  }
  // coupon does not started yet
  if (
    coupon.couponStatus == "Valid" &&
    moment().isBefore(moment(new Date(coupon.fromDate)).tz("Africa/Cairo"))
  ) {
    expiredNotStart = true;
  }
  // user not assgined
  for (const assginedUser of coupon.couponAssginedToUser) {
    if (assginedUser.userId.toString() == userId.toString()) {
      matched = true;
      // user exceed maxUsage
      if (assginedUser.maxUsage <= assginedUser.usageCount) {
        exceed = true;
      }
    }
  }
  return { expired, matched, exceed, expiredNotStart };
};
