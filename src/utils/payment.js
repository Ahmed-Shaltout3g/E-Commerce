import Stripe from "stripe";

export const paymentFunction = async ({
  payment_method_types = ["card"],
  mode = "payment",
  customer_email = "",
  metadata = {},
  success_url,
  cancel_url,
  discounts = [],
  line_items = [],
}) => {
  const stripe = new Stripe(process.env.PAYMENT_SECRET_KEY);
  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types,
    mode,
    customer_email,
    metadata,
    success_url,
    cancel_url,
    discounts,
    line_items,
  });
  return paymentData;
};
