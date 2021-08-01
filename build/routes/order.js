"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersRequest = exports.getAddressRequest = exports.getTrackerRequest = exports.getOrderRequest = exports.Trackerupdate = exports.deliver = exports.pickUp = exports.makeOrder = void 0;
const order_1 = require("../controllers/order");
const makeOrder = async (req, res) => {
    try {
        const response = await order_1.makeOrderRequest(req.body);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.makeOrder = makeOrder;
const pickUp = async (req, res) => {
    try {
        const response = await order_1.pickUpOrder(req.body);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.pickUp = pickUp;
const deliver = async (req, res) => {
    try {
        const response = await order_1.deliverOrder(req.body);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.deliver = deliver;
const Trackerupdate = async (req, res) => {
    try {
        const response = await order_1.updateTracker(req.body);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.Trackerupdate = Trackerupdate;
const getOrderRequest = async (req, res) => {
    try {
        console.log(req.query.reference);
        const response = await order_1.getOrder(req.query.reference);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.getOrderRequest = getOrderRequest;
const getTrackerRequest = async (req, res) => {
    try {
        console.log(req.query.reference);
        const response = await order_1.getTracker(req.query.reference);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.getTrackerRequest = getTrackerRequest;
const getAddressRequest = async (req, res) => {
    try {
        const response = await order_1.getAddress();
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.getAddressRequest = getAddressRequest;
const getOrdersRequest = async (req, res) => {
    try {
        console.log(req.query.user_id);
        const response = await order_1.getOrders(req.query.user_id);
        const responseCode = response.success === true ? 200 : 400;
        return res.status(responseCode).json(response);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Could not fetch beneficiaries.' });
    }
};
exports.getOrdersRequest = getOrdersRequest;
//# sourceMappingURL=order.js.map