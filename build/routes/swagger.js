"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// eslint-disable-next-line prettier/prettier
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const secrets_1 = require("../utils/secrets");
const router = express_1.default.Router();
const swaggerConfig = {
    definition: {
        info: {
            title: 'PAYSTACK SHOPPING CART',
            version: '1.0.0',
            description: 'To test the shopping Cart Endpoints',
            host: `localhost:${secrets_1.PORT}`,
            basePath: '/',
        },
    },
    //   swaggerDefinition,
    apis: ['./**/routes/index.ts', './**/routes/**.routes.ts'],
};
const options = {
    explorer: true,
};
router.use('/', swagger_ui_express_1.default.serve);
router.get('/', swagger_ui_express_1.default.setup((0, swagger_jsdoc_1.default)(swaggerConfig), options));
exports.default = router;
//# sourceMappingURL=swagger.js.map