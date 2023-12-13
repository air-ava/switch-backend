import BankTransferService from '../services/bankTransfer.service';

import { ControllerResponse } from '../dto/responseInterfaces.dto';
// import { wrapGrpcUnaryCall } from '../utils/response';
import ResponseService from '../utils/response';

export const notifySlack = ResponseService.wrapGrpcUnaryCall<{ type: string }, ControllerResponse>(BankTransferService.notifySlack);

// export const retrieveBillCategories = ResponseService.wrapGrpcUnaryCall<{ billerCode: string }, { categories: IBillCategory[] }, ControllerResponse>(
//   getBillersCategories,
// );
