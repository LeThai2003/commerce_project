import { Express } from "express";
import { productRoute } from "./product.route";
import { userRoutes } from "./user.route";
import { cartRoute } from "./cart.route";
import { orderRoute } from "./order.route";
import { verifyPhoneRoute } from "./verify_phone.route";
import { accountRoutes } from "./account.route";
import { categoryRoutes } from "./category.route";
import { rateRoute } from "./rate.route";
import { uploadRoute } from "./upload.route";
import verifyToken from "../../middlewares/client/verifyToken.middleware";



const clientRoutes = (app: Express): void => {

    app.use("/categories", categoryRoutes);
    
    app.use("/products", productRoute);

    app.use("/user", userRoutes);

    app.use("/cart", verifyToken, cartRoute);
  
    app.use("/order", verifyToken, orderRoute);
  
    app.use("/verify-phone", verifyToken, verifyPhoneRoute);
  
    app.use("/account", verifyToken, accountRoutes);

    app.use("/rate", verifyToken, rateRoute);

    app.use(`/upload`, uploadRoute);
  };

export default clientRoutes;