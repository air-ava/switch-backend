"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressCreator = exports.userResource = void 0;
const user_1 = require("../controllers/user");
const userResource = async (req, res) => {
    try {
        const response = await user_1.createUser(req.body);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.userResource = userResource;
const AddressCreator = async (req, res) => {
    try {
        const response = await user_1.createAddress(req.body);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.AddressCreator = AddressCreator;
//# sourceMappingURL=user.js.map