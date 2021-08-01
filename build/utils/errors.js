"use strict";
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
// eslint-disable-next-line max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceNotFoundError = exports.BadRequestError = void 0;
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
//# sourceMappingURL=errors.js.map