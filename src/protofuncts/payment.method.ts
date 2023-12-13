import { ControllerResponse } from '../dto/responseInterfaces.dto';
// import { wrapGrpcUnaryCall } from '../utils/response';
import ResponseService from '../utils/response';

// export const retrieveBillers = ResponseService.wrapGrpcUnaryCall<
//   { type: string },
//   { billers: { billerName: string; billerCode: string }[] },
//   ControllerResponse
// >(getBillers);

// export const retrieveBillCategories = ResponseService.wrapGrpcUnaryCall<{ billerCode: string }, { categories: IBillCategory[] }, ControllerResponse>(
//   getBillersCategories,
// );
