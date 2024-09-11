import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";


dotenv.config();

const app : Express = express();
const port : (number | string) = process.env.PORT || 3000;

app.use("/", (req: Request, res: Response) => {
    
    res.json({
        hello: "Xin chào"
    });
})

app.listen((port), () => {
    console.log("Đang chạy trên cổng: " + port);
});