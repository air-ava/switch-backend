/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { generate } from 'randomstring';
import { getOrderSchema, makeOrderSchema, trackerSchema, updateOrderSchema } from '../authSchema/orderSchema';
import { getQueryRunner } from '../database/helpers/db';
import { Addresses } from '../database/models/Addresses';
import { Orders } from '../database/models/Order';
import { Tracking } from '../database/models/Tracking';
import { Users } from '../database/models/Users';
import { ResourceNotFoundError } from '../utils/errors';

import { theResponse } from '../utils/interface';
import { createOrderDTO } from './dto/orderDTO';

export const makeOrderRequest = async (data: createOrderDTO): Promise<theResponse> => {
  const validation = makeOrderSchema.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();
  await queryRunner.startTransaction();

  const reference = `${generate({ length: 5, capitalization: 'uppercase', charset: 'alphabetic' })}-${generate({ length: 6, charset: 'numeric' })}`;
  const trackreference = `${generate({ length: 5, capitalization: 'uppercase', charset: 'alphabetic' })}-${generate({
    length: 6,
    charset: 'numeric',
  })}`;

  try {
    const [buyer, seller] = await Promise.all([
      await queryRunner.manager.findOne(Users, {
        where: [{ id: data.user_id }],
        relations: ['address'],
      }),
      await queryRunner.manager.findOne(Users, {
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

    const order = await queryRunner.manager.save(Orders, {
      reference,
      payment_reference: data.payment_reference,
      status: 'PENDING',
      item_name: data.item_name,
      item_amount: data.item_amount,
      description: data.description,
      ...(data.weight && { weight: data.weight }),
      ...(data.image_url && { image_url: data.image_url }),
      user: buyer,
      pickup: buyer!.address,
      delivery: seller!.address,
    });

    const tracking = await queryRunner.manager.save(Tracking, {
      reference: trackreference,
      order,
      location_address_id: order.pickup.id,
    });

    await queryRunner.manager.update(
      Orders,
      { reference },
      {
        tracking_ref: tracking.reference,
      },
    );

    await queryRunner.commitTransaction();

    return {
      success: true,
      message: 'Order created successfully',
      data: { ...order, tracking: tracking.reference },
    };
  } catch (e) {
    await queryRunner.rollbackTransaction();
    console.log({ e });
    return {
      success: false,
      message: 'Order creation failed, kindly try again',
    };
  } finally {
    await queryRunner.release();
  }
};

export const pickUpOrder = async (data: { reference: string }): Promise<theResponse> => {
  const validation = updateOrderSchema.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();

  await queryRunner.startTransaction();
  try {
    const reference = `${generate({ length: 5, capitalization: 'uppercase', charset: 'alphabetic' })}-${generate({ length: 6, charset: 'numeric' })}`;
    const order = await queryRunner.manager.findOne(Orders, {
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

    await queryRunner.manager.save(Tracking, {
      reference: order.tracking_ref,
      order,
      location_address_id: order.pickup.id,
    });

    await queryRunner.manager.update(
      Orders,
      { reference: data.reference },
      {
        picked_up: true,
        status: 'PICKED_UP',
      },
    );

    await queryRunner.commitTransaction();

    return {
      success: true,
      message: 'Order picked up successfully',
    };
  } catch (e) {
    console.log({ e });
    await queryRunner.rollbackTransaction();
    return {
      success: false,
      message: 'Order pickup failed, kindly try again',
    };
  }
};

export const deliverOrder = async (data: { reference: string }): Promise<theResponse> => {
  const validation = updateOrderSchema.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();
  await queryRunner.startTransaction();

  try {
    const order = await queryRunner.manager.findOne(Orders, {
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
        await queryRunner.manager.update(
          Orders,
          { reference: data.reference },
          {
            delivered: false,
            status: 'PENDING',
          },
        );
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

    const tracking = await queryRunner.manager.save(Tracking, {
      reference: order.tracking_ref,
      order,
      location_address_id: order.delivery.id,
    });

    await queryRunner.manager.update(
      Orders,
      { reference: data.reference },
      {
        delivered: true,
        status: 'DELIVERED',
      },
    );
    await queryRunner.commitTransaction();

    return {
      success: true,
      message: 'Order delivered successfully',
      data: tracking,
    };
  } catch (e) {
    await queryRunner.rollbackTransaction();
    console.log({ e });
    return {
      success: false,
      message: 'Order delivery failed, kindly try again',
    };
  }
};

export const updateTracker = async (data: { order_ref: string; address_id: number }): Promise<theResponse> => {
  const validation = trackerSchema.validate(data);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();
  await queryRunner.startTransaction();

  try {
    const order = await queryRunner.manager.findOne(Orders, {
      where: [{ reference: data.order_ref }],
      relations: ['pickup', 'delivery'],
    });

    if (!order)
      return {
        success: false,
        message: `Order does not exists`,
      };

    if (data.address_id === order!.delivery.id) return await deliverOrder({ reference: data.order_ref });
    if (data.address_id === order!.pickup.id) return await pickUpOrder({ reference: data.order_ref });

    if (!order.picked_up) {
      if (order.delivered) {
        await queryRunner.manager.update(
          Orders,
          { reference: data.order_ref },
          {
            delivered: false,
            status: 'PENDING',
          },
        );
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

    const address = await queryRunner.manager.findOne(Addresses, { id: data.address_id });

    await queryRunner.manager.save(Tracking, {
      reference: order!.tracking_ref,
      order,
      location_address_id: data.address_id,
    });

    await queryRunner.manager.update(
      Orders,
      { reference: order!.reference },
      {
        status: `${address?.type === 'is_wharehouse' ? 'WAREHOUSE' : 'IN_TRANSIT'}`,
      },
    );
    await queryRunner.commitTransaction();
    return {
      success: true,
      message: 'Order Tracking Updated successfully',
    };
  } catch (e) {
    console.log({ e });
    return {
      success: false,
      message: 'Order delivery failed, kindly try again',
    };
  }
};

export const getOrder = async (reference: string): Promise<theResponse> => {
  const validation = getOrderSchema.validate(reference);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();

  try {
    const order = await queryRunner.manager.findOne(Orders, {
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
      data: { ...order },
    };
  } catch (e) {
    console.log({ e });
    return {
      success: false,
      message: 'Order retrieval failed, kindly try again',
    };
  }
};

export const getTracker = async (reference: string): Promise<theResponse> => {
  const validation = getOrderSchema.validate(reference);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();

  try {
    const tracking = await queryRunner.manager.find(Tracking, {
      where: [{ reference }],
    });

    if (!tracking)
      return {
        success: false,
        message: `Tracker Id does not exists`,
      };

    const trackedAddress = await Promise.all(
      tracking.map(async (track) => {
        const address = await queryRunner.manager.findOne(Addresses, {
          where: [{ id: track.location_address_id }],
        });

        if (!address)
          return {
            success: false,
            message: `Address does not exists`,
          };
        return { address, track };
      }),
    );

    return {
      success: true,
      message: 'Order tracked successfully',
      data: { trackedAddress },
    };
  } catch (e) {
    console.log({ e });
    return {
      success: false,
      message: 'Order tracking failed, kindly try again',
    };
  }
};

export const getOrders = async (user_id: string): Promise<theResponse> => {
  const validation = getOrderSchema.validate(user_id);
  if (validation.error) return ResourceNotFoundError(validation.error);

  const queryRunner = await getQueryRunner();

  try {
    const user = await queryRunner.manager.findOne(Users, {
      where: [{ id: user_id }],
    });
    const orders = await queryRunner.manager.find(Orders, {
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
  } catch (e) {
    console.log({ e });
    return {
      success: false,
      message: 'Order tracking failed, kindly try again',
    };
  }
};

export const getAddress = async (): Promise<theResponse> => {
  const queryRunner = await getQueryRunner();

  try {
    const address = await queryRunner.manager.find(Addresses);

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
  } catch (e) {
    console.log({ e });
    return {
      success: false,
      message: 'Address retrieval failed, kindly try again',
    };
  }
};
