import express, { Request, Response } from 'express';

// eslint-disable-next-line prettier/prettier
import authRouter from './auth.office.routes';
// import businessRouter from './business.routes';
// import schoolRouter from './school.routes';
// import studentRouter from './student.routes';
// import productRouter from './product.routes';
// import publicRouter from './public.routes';
// import addressRouter from './address.routes';
// import cartRouter from './cart.routes';
// import checkoutRouter from './checkout.routes';
import userRouter from './user.office.routes';
// import webhookRouter from './webhook.routes';
// import miscillaneousRouter from './miscillaneous.routes';
// import banksRouter from './bank.routes';
// import settlementsRouter from './settlements.routes';
// import scholarshipRouter from './scholarship.routes';
// import transactionsRouter from './transactions.routes';
// import walletsRouter from './wallets.routes';
import paymentsRouter from './payment.office.routes';
import { validateSession } from '../../middleware/auth.middleware';
// import Settings from '../services/settings.service';

const router = express.Router();

router.get('/', (_, res) => res.json({ success: true, message: 'User Admin gateway v1 up.' }));

router.use('/auth', authRouter);
router.use(validateSession);
router.use('/user', userRouter);
// router.use('/business', businessRouter);
// router.use('/school', schoolRouter);
// router.use('/students', studentRouter);
// router.use('/scholarship', scholarshipRouter);
// router.use('/transactions', transactionsRouter);
// router.use('/wallets', walletsRouter);
router.use('/payments', paymentsRouter);
// router.use('/product', productRouter);
// router.use('/address', addressRouter);
// router.use('/cart', cartRouter);
// router.use('/checkout', checkoutRouter);
// router.use('/misc', miscillaneousRouter);
// router.use('/banks', banksRouter);
// router.use('/settlements', settlementsRouter);

export default router;
