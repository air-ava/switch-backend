"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddress = exports.getOrders = exports.getTracker = exports.getOrder = exports.updateTracker = exports.deliverOrder = exports.pickUpOrder = exports.makeOrderRequest = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const randomstring_1 = require("randomstring");
const orderSchema_1 = require("../authSchema/orderSchema");
const db_1 = require("../database/helpers/db");
const Addresses_1 = require("../database/models/Addresses");
const Order_1 = require("../database/models/Order");
const Tracking_1 = require("../database/models/Tracking");
const Users_1 = require("../database/models/Users");
const errors_1 = require("../utils/errors");
const makeOrderRequest = async (data) => {
    const validation = orderSchema_1.makeOrderSchema.validate(data);
    if (validation.error)
        return errors_1.ResourceNotFoundError(validation.error);
    const queryRunner = await db_1.getQueryRunner();
    await queryRunner.startTransaction();
    const reference = `${randomstring_1.generate({ length: 5, capitalization: 'uppercase', charset: 'alphabetic' })}-${randomstring_1.generate({ length: 6, charset: 'numeric' })}`;
    const trackreference = `${randomstring_1.generate({ length: 5, capitalization: 'uppercase', charset: 'alphabetic' })}-${randomstring_1.generate({
        length: 6,
        charset: 'numeric',
    })}`;
    try {
        const [buyer, seller] = await Promise.all([
            await queryRunner.manager.findOne(Users_1.Users, {
                where: [{ id: data.user_id }],
                relations: ['address'],
            }),
            await queryRunner.manager.findOne(Users_1.Users, {
                where: [{ id: data.seller_id }],
                relations: ['address'],
            }),
        ]);
        if (!buyer || !seller)
            return {
                success: false,
                message: `${!buyer ? 'User' : 'Seller'} does not exists`,
            };
        if (buyer.id === seller.id)
            return {
                success: false,
                message: `You can't deliver to yourself does not exists`,
            };
        const order = await queryRunner.manager.save(Order_1.Orders, Object.assign(Object.assign(Object.assign({ reference, payment_reference: data.payment_reference, status: 'PENDING', item_name: data.item_name, item_amount: data.item_amount, description: data.description }, (data.weight && { weight: data.weight })), (data.image_url && { image_url: data.image_url })), { user: buyer, pickup: buyer.address, delivery: seller.address }));
        const tracking = await queryRunner.manager.save(Tracking_1.Tracking, {
            reference: trackreference,
            order,
            location_address_id: order.pickup.id,
        });
        await queryRunner.manager.update(Order_1.Orders, { reference }, {
            tracking_ref: tracking.reference,
        });
        await queryRunner.commitTransaction();
        return {
            success: true,
            message: 'Order created successfully',
            data: Object.assign(Object.assign({}, order), { tracking: tracking.reference }),
        };
    }
    catch (e) {
        await queryRunner.rollbackTransaction();
        console.log({ e });
        return {
            success: false,
            message: 'Order creation failed, kindly try again',
        };
    }
    finally {
        await queryRunner.release();
    }
};
exports.makeOrderRequest = makeOrderRequest;
const pickUpOrder = async (data) => {
    const validation = orderSchema_1.updateOrderSchema.validate(data);
    if (validation.error)
        return errors_1.ResourceNotFoundError(validation.error);
    const queryRunner = await db_1.getQueryRunner();
    await queryRunner.startTransaction();
    try {
        const reference = `${randomstring_1.generate({ length: 5, capitalization: 'uppercase', charset: 'alphabetic' })}-${randomstring_1.generate({ length: 6, charset: 'numeric' })}`;
        const order = await queryRunner.manager.findOne(Order_1.Orders, {
            where: [{ reference: data.reference }],
            relations: ['pickup'],
        });
        if (!order)
            return {
                success: false,
                message: `Order does not exists`,
            };
        if (order.picked_up)
            return {
                success: false,
                message: `Order Picked Up Already`,
            };
        await queryRunner.manager.save(Tracking_1.Tracking, {
            reference: order.tracking_ref,
            order,
            location_address_id: order.pickup.id,
        });
        await queryRunner.manager.update(Order_1.Orders, { reference: data.reference }, {
            picked_up: true,
            status: 'PICKED_UP',
        });
        await queryRunner.commitTransaction();
        return {
            success: true,
            message: 'Order picked up successfully',
        };
    }
    catch (e) {
        console.log({ e });
        await queryRunner.rollbackTransaction();
        return {
            success: false,
            message: 'Order pickup failed, kindly try again',
        };
    }
};
exports.pickUpOrder = pickUpOrder;
const deliverOrder = async (data) => {
    const validation = orderSchema_1.updateOrderSchema.validate(data);
    if (validation.error)
        return errors_1.ResourceNotFoundError(validation.error);
    const queryRunner = await db_1.getQueryRunner();
    await queryRunner.startTransaction();
    try {
        const order = await queryRunner.manager.findOne(Order_1.Orders, {
            where: [{ reference: data.reference }],
            relations: ['delivery'],
        });
        if (!order)
            return {
                success: false,
                message: `Order does not exists`,
            };
        if (!order.picked_up) {
            if (order.delivered) {
                await queryRunner.manager.update(Order_1.Orders, { reference: data.reference }, {
                    delivered: false,
                    status: 'PENDING',
                });
            }
            return {
                success: false,
                message: `Order Not Picked Up Yet`,
            };
        }
        if (order.delivered)
            return {
                success: false,
                message: `Order Delivered Already`,
            };
        const tracking = await queryRunner.manager.save(Tracking_1.Tracking, {
            reference: order.tracking_ref,
            order,
            location_address_id: order.delivery.id,
        });
        await queryRunner.manager.update(Order_1.Orders, { reference: data.reference }, {
            delivered: true,
            status: 'DELIVERED',
        });
        await queryRunner.commitTransaction();
        return {
            success: true,
            message: 'Order delivered successfully',
            data: tracking,
        };
    }
    catch (e) {
        await queryRunner.rollbackTransaction();
        console.log({ e });
        return {
            success: false,
            message: 'Order delivery failed, kindly try again',
        };
    }
};
exports.deliverOrder = deliverOrder;
const updateTracker = async (data) => {
    const validation = orderSchema_1.trackerSchema.validate(data);
    if (validation.error)
        return errors_1.ResourceNotFoundError(validation.error);
    const queryRunner = await db_1.getQueryRunner();
    await queryRunner.startTransaction();
    try {
        const order = await queryRunner.manager.findOne(Order_1.Orders, {
            where: [{ reference: data.order_ref }],
            relations: ['pickup', 'delivery'],
        });
        if (!order)
            return {
                success: false,
                message: `Order does not exists`,
            };
        if (data.address_id === order.delivery.id)
            return await exports.deliverOrder({ reference: data.order_ref });
        if (data.address_id === order.pickup.id)
            return await exports.pickUpOrder({ reference: data.order_ref });
        if (!order.picked_up) {
            if (order.delivered) {
                await queryRunner.manager.update(Order_1.Orders, { reference: data.order_ref }, {
                    delivered: false,
                    status: 'PENDING',
                });
            }
            return {
                success: false,
                message: `Order Not Picked Up Yet`,
            };
        }
        if (order.delivered)
            return {
                success: false,
                message: `Order Delivered Already`,
            };
        const address = await queryRunner.manager.findOne(Addresses_1.Addresses, { id: data.address_id });
        await queryRunner.manager.save(Tracking_1.Tracking, {
            reference: order.tracking_ref,
            order,
            location_address_id: data.address_id,
        });
        await queryRunner.manager.update(Order_1.Orders, { reference: order.reference }, {
            status: `${(address === null || address === void 0 ? void 0 : address.type) === 'is_wharehouse' ? 'WAREHOUSE' : 'IN_TRANSIT'}`,
        });
        await queryRunner.commitTransaction();
        return {
            success: true,
            message: 'Order Tracking Updated successfully',
        };
    }
    catch (e) {
        console.log({ e });
        return {
            success: false,
            message: 'Order delivery failed, kindly try again',
        };
    }
};
exports.updateTracker = updateTracker;
const getOrder = async (reference) => {
    const validation = orderSchema_1.getOrderSchema.validate(reference);
    if (validation.error)
        return errors_1.ResourceNotFoundError(validation.error);
    const queryRunner = await db_1.getQueryRunner();
    try {
        const order = await queryRunner.manager.findOne(Order_1.Orders, {
            where: [{ reference }],
        });
        if (!order)
            return {
                success: false,
                message: `Order does not exists`,
            };
        return {
            success: true,
            message: 'Order retrievied successfully',
            data: Object.assign({}, order),
        };
    }
    catch (e) {
        console.log({ e });
        return {
            success: false,
            message: 'Order retrieval failed, kindly try again',
        };
    }
};
exports.getOrder = getOrder;
const getTracker = async (reference) => {
    const validation = orderSchema_1.getOrderSchema.validate(reference);
    if (validation.error)
        return errors_1.ResourceNotFoundError(validation.error);
    const queryRunner = await db_1.getQueryRunner();
    try {
        const tracking = await queryRunner.manager.find(Tracking_1.Tracking, {
            where: [{ reference }],
        });
        if (!tracking)
            return {
                success: false,
                message: `Tracker Id does not exists`,
            };
        const trackedAddress = await Promise.all(tracking.map(async (track) => {
            const address = await queryRunner.manager.findOne(Addresses_1.Addresses, {
                where: [{ id: track.location_address_id }],
            });
            if (!address)
                return {
                    success: false,
                    message: `Address does not exists`,
                };
            return { address, track };
        }));
        return {
            success: true,
            message: 'Order tracked successfully',
            data: { trackedAddress },
        };
    }
    catch (e) {
        console.log({ e });
        return {
            success: false,
            message: 'Order tracking failed, kindly try again',
        };
    }
};
exports.getTracker = getTracker;
const getOrders = async (user_id) => {
    const validation = orderSchema_1.getOrderSchema.validate(user_id);
    if (validation.error)
        return errors_1.ResourceNotFoundError(validation.error);
    const queryRunner = await db_1.getQueryRunner();
    try {
        const user = await queryRunner.manager.findOne(Users_1.Users, {
            where: [{ id: user_id }],
        });
        const orders = await queryRunner.manager.find(Order_1.Orders, {
            where: [{ user }],
        });
        if (!orders)
            return {
                success: false,
                message: `Can't find your orders`,
            };
        return {
            success: true,
            message: 'Orders gotten successfully',
            data: { orders },
        };
    }
    catch (e) {
        console.log({ e });
        return {
            success: false,
            message: 'Order tracking failed, kindly try again',
        };
    }
};
exports.getOrders = getOrders;
const getAddress = async () => {
    const queryRunner = await db_1.getQueryRunner();
    try {
        const address = await queryRunner.manager.find(Addresses_1.Addresses);
        if (!address)
            return {
                success: false,
                message: `No Addresses does not exists`,
            };
        return {
            success: true,
            message: 'Address gotten successfully',
            data: { address },
        };
    }
    catch (e) {
        console.log({ e });
        return {
            success: false,
            message: 'Address retrieval failed, kindly try again',
        };
    }
};
exports.getAddress = getAddress;
//# sourceMappingURL=order.js.map