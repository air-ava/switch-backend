import { RequestHandler } from 'express';
import ResponseService from '../utils/response';

const test: RequestHandler = async (req, res) => {
  ResponseService.success(res, 'OK');
  console.log(req.body);
};

export default test;
