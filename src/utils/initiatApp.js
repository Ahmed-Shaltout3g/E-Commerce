import { connectionDB } from "../../DB/connection.js";
import * as allRoutes from "../modules/index.routes.js";
import { changeCouponStatus, deleteCouponExpired } from "./crons.js";
import { globalResponse } from "./errorHandling.js";
import cors from "cors";
export const initatApp = (express, app) => {
  const port = process.env.PORT || 5000;

  app.use(express.json());
  app.use(cors());
  connectionDB();
  app.use("/category", allRoutes.catagoryRoutes);
  app.use("/subcategory", allRoutes.subCatagoryRoutes);
  app.use("/brand", allRoutes.brandRoutes);
  app.use("/product", allRoutes.productRoutes);
  app.use("/coupon", allRoutes.couponRoutes);
  app.use("/auth", allRoutes.authRoutes);
  app.use("/cart", allRoutes.cartRoutes);
  app.use("/order", allRoutes.orderRoutes);

  app.get("/", (req, res) => {
    res.send("hello from simple server :)");
  });
  app.all("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
  });
  app.use(globalResponse);
  // crons
  changeCouponStatus();
  deleteCouponExpired();
  app.listen(port, () =>
    console.log("> Server is up and running on port : " + port)
  );
};
