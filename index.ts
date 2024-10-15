import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import YAML from "yaml";
import fs from "fs";

dotenv.config();

import clientRoutes from "./routes/client/index.route";
import adminRoutes from "./routes/admin/index.route";
import path from "path";

const app : Express = express();
const port : (number | string) = process.env.PORT || 3000;

app.use(cors());

const file = fs.readFileSync(path.resolve(`${__dirname}/swagger.yaml`), 'utf8');
const swaggerDocument = YAML.parse(file);

console.log('Swagger file path:', path.resolve(`${__dirname}/swagger.yaml`));

app.get('/swagger.yaml', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'swagger.yaml'));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// const swaggerDocumentUrl = 'https://commerce-project-2-nine.vercel.app/swagger.yaml';

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
//   swaggerUrl: swaggerDocumentUrl,
// }));

// set public folders
app.use(express.static(`${__dirname}/public`))

// views
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

/* New Route to the TinyMCE Node module */
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

//router
clientRoutes(app);
adminRoutes(app);

app.listen(3000, '0.0.0.0', () => {
    console.log("Đang chạy trên cổng: " + port);
});