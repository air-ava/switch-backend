"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackerSchema = exports.updateOrderSchema = exports.getOrderSchema = exports.makeOrderSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.makeOrderSchema = joi_1.default.object().keys({
    image_url: joi_1.default.string().regex(/^https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^/#?]+)+\.(?:jpg|jpeg|gif|png|bmp|tiff|tga|svg)$/),
    payment_reference: joi_1.default.string().required(),
    item_name: joi_1.default.string().required(),
    item_amount: joi_1.default.number().greater(10).required(),
    description: joi_1.default.string().min(3).message('description must have more than 3 Characters').required(),
    weight: joi_1.default.number().greater(0).allow(null),
    user_id: joi_1.default.number().required(),
    seller_id: joi_1.default.number().required(),
});
exports.getOrderSchema = joi_1.default.string().required();
exports.updateOrderSchema = joi_1.default.object().keys({
    reference: joi_1.default.string().required(),
});
exports.trackerSchema = joi_1.default.object().keys({
    order_ref: joi_1.default.string().required(),
    address_id: joi_1.default.number().required(),
});
//# sourceMappingURL=orderSchema.js.map