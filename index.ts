import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

import clientRoutes from "./routes/client/index.route";
import adminRoutes from "./routes/admin/index.route";

const app : Express = express();
const port : (number | string) = process.env.PORT || 3000;

// views
app.set("views", "./views");
app.set("view engine", "pug");

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//router
clientRoutes(app);
adminRoutes(app);

app.listen((port), () => {
    console.log("Đang chạy trên cổng: " + port);
});