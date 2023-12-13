import BankTransferService from '../services/bankTransfer.service';
import { ControllerResponse } from '../dto/responseInterfaces.dto';
import ResponseService from '../utils/response';

export const notifySlack = ResponseService.wrapGrpcUnaryCall<{ type: string }, ControllerResponse>(BankTransferService.notifySlack);
