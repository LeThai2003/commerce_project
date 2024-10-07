import { Express } from "express";
import { productRoute } from "./product.route";
import { userRoutes } from "./user.route";
import { cartRoute } from "./cart.route";
import { orderRoute } from "./order.route";
import { verifyPhoneRoute } from "./verify_phone.route";
import { accountRoutes } from "./account.route";

import verifyToken from "../../middlewares/client/verifyToken.middleware";


const clientRoutes = (app: Express): void => {
    app.use("/products", productRoute);

    app.use("/user", userRoutes);

    app.use("/cart", verifyToken, cartRoute);
  
    app.use("/order", verifyToken, orderRoute);
  
    app.use("/verify-phone", verifyToken, verifyPhoneRoute);
  
    app.use("/account", verifyToken, accountRoutes);
  };

export default clientRoutes;