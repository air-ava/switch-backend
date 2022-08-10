"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const bcrypt = __importStar(require("bcrypt"));
const users_model_1 = require("../database/models/users.model");
const user_validator_1 = require("../validators/user.validator");
const errors_1 = require("../utils/errors");
const db_1 = require("../database/helpers/db");
// import { Addresses } from '../database/models/Addresses';
const createUser = async (data) => {
    const validation = user_validator_1.userSchema.validate(data);
    if (validation.error)
        return (0, errors_1.ResourceNotFoundError)(validation.error);
    const queryRunner = await (0, db_1.getQueryRunner)();
    await queryRunner.startTransaction();
    try {
        const userAlreadyExist = await queryRunner.manager.findOne(users_model_1.Users, {
            where: [{ email: data.email }, { phone_number: data.phone_number }],
        });
        if (userAlreadyExist)
            return {
                success: false,
                message: 'Account already exists',
            };
        const user = await queryRunner.manager.save(users_model_1.Users, {
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            phone_number: data.phone_number.replace('+', ''),
            password: bcrypt.hashSync(data.password, 8),
        });
        const addressData = {
            user,
            address: data.address,
            country: data.country,
            state: data.state,
            city: data.city,
        };
        if (data.is_business) {
            if (!data.business_mobile)
                return {
                    success: false,
                    message: 'Add a business Mobile',
                };
            addressData.business_mobile = data.business_mobile;
            addressData.type = 'is_business';
        }
        // const address: Addresses = await queryRunner.manager.save(Addresses, addressData);
        // await queryRunner.manager.update(Users, { id: user.id }, { address });
        await queryRunner.commitTransaction();
        return {
            success: true,
            message: 'Account created successfully',
            // data: { address },
        };
    }
    catch (e) {
        await queryRunner.rollbackTransaction();
        console.log({ e });
        return {
            success: false,
            message: 'Account creation failed, kindly try again',
        };
    }
    finally {
        await queryRunner.release();
    }
};
exports.createUser = createUser;
//# sourceMappingURL=user.service.js.map