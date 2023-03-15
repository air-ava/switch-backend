/* eslint-disable max-classes-per-file */
import joi from 'joi';

export const bankListValidator = joi.string().valid('UGANDA').required()