import express from 'express';

import { deliver, getAddressRequest, getOrderRequest, getOrdersRequest, getTrackerRequest, makeOrder, pickUp, Trackerupdate } from './order';
import { AddressCreator, userResource } from './user';
// import { validateSession } from './auth';

const router = express.Router();

router.get('/', (_, res) => res.json({ success: true, message: 'User gateway v1 up.' }));

// router.use(validateSession);
router.post('/user', userResource);
router.post('/address', AddressCreator);
router.post('/makeOrder', makeOrder);
router.post('/pickUp', pickUp);
router.post('/deliver', deliver);
router.post('/tracker-update', Trackerupdate);
router.get('/order', getOrderRequest);
router.get('/get-tracker', getTrackerRequest);
router.get('/get-address', getAddressRequest);
router.get('/get-orders', getOrdersRequest);

export default router;
