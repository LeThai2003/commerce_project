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
import { addressRoute } from "./address.route";
import { commentRoute } from "./comment.route";
import { blogRoute } from "./blog.route";
import { contactRoute } from "./contact.route";


const clientRoutes = (app: Express): void => {

    app.use("/categories", categoryRoutes);
    
    app.use("/products", productRoute);

    app.use("/user", userRoutes);

    app.use("/cart", verifyToken, cartRoute);
  
    app.use("/order", verifyToken, orderRoute);
  
    app.use("/verify-phone", verifyPhoneRoute);
  
    app.use("/account", verifyToken, accountRoutes);

    app.use("/rate", rateRoute);

    app.use("/comment", commentRoute);

    app.use("/contacts", contactRoute);

    app.use("/blogs", blogRoute);

    app.use(`/upload`, uploadRoute);

    app.use(`/address`, verifyToken, addressRoute);
  };

export default clientRoutes;