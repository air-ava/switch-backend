"use strict";
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
// eslint-disable-next-line max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestException = exports.sendObjectResponse = exports.ResourceNotFoundError = exports.BadRequestError = void 0;
const logs_1 = require("./logs");
const BadRequestError = (error) => {
    console.log(error);
    return {
        error,
        success: false,
        data: null,
    };
};
exports.BadRequestError = BadRequestError;
const ResourceNotFoundError = (errors) => {
    console.log(errors);
    return {
        error: errors.message,
        success: false,
        data: null,
    };
};
exports.ResourceNotFoundError = ResourceNotFoundError;
const sendObjectResponse = (message, data) => {
    return {
        success: true,
        message,
        data,
    };
};
exports.sendObjectResponse = sendObjectResponse;
const BadRequestException = (error, data) => {
    const newErr = typeof data === 'object' && JSON.stringify(data);
    (0, logs_1.log)(logs_1.Log.fg.yellow, newErr || data.message);
    return {
        success: false,
        error,
        data,
    };
};
exports.BadRequestException = BadRequestException;
//# sourceMappingURL=errors.js.map