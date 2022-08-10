"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUp = void 0;
const user_service_1 = require("../services/user.service");
const signUp = async (req, res) => {
    try {
        const response = await (0, user_service_1.createUser)(req.body);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.signUp = signUp;
//# sourceMappingURL=user.controller.js.map