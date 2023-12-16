import { IUser, ISchools } from "../database/modelInterfaces";

export interface assignAccountNumberDTO {
  holder: 'student' | 'school';
  holderId: string;
  user: IUser;
  school: ISchools;
}
