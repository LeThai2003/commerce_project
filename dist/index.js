"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const method_override_1 = __importDefault(require("method-override"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const yaml_1 = __importDefault(require("yaml"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const index_route_1 = __importDefault(require("./routes/client/index.route"));
const index_route_2 = __importDefault(require("./routes/admin/index.route"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
const file = fs_1.default.readFileSync(path_1.default.resolve(`${__dirname}/swagger.yaml`), 'utf8');
const swaggerDocument = yaml_1.default.parse(file);
console.log('Swagger file path:', path_1.default.resolve(`${__dirname}/swagger.yaml`));
app.get('/swagger.yaml', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'swagger.yaml'));
});
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.use(express_1.default.static(`${__dirname}/public`));
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");
app.use((0, method_override_1.default)('_method'));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use('/tinymce', express_1.default.static(path_1.default.join(__dirname, 'node_modules', 'tinymce')));
(0, index_route_1.default)(app);
(0, index_route_2.default)(app);
app.listen(3000, '0.0.0.0', () => {
    console.log("Đang chạy trên cổng: " + port);
});
