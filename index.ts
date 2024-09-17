import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

import sequelize from "./configs/database";
import clientRoutes from "./routes/client/index.route";

const app : Express = express();
const port : (number | string) = process.env.PORT || 3000;


// parse application/json
app.use(bodyParser.json());

//router
clientRoutes(app);

app.listen((port), () => {
    console.log("Đang chạy trên cổng: " + port);
});