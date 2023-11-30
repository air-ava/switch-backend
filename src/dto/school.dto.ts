import { IOrganisation, IQuestions, ISchools, IUser } from '../database/modelInterfaces';

export interface questionsDTO {
  question: number;
  answer: boolean;
}

export interface answerDTO {
  title: number;
  questions: questionsDTO[];
  user: IUser;
}

export interface answerQuestionTitlesDTO {
  title_id: number;
  questions: IQuestions[];
  answers: answerDTO[];
}

export interface answerTextQuestionsDTO {
  question: number;
  answer: string;
  user: string;
}

export interface answerBooleanQuestionsDTO {
  question: number;
  answer: boolean;
  user: string;
}

export interface answerQuestionsDTO {
  title: number;
  answers: questionsDTO[];
  user: IUser;
  questionTypes: {
    checkbox: number;
    text: number;
  };
}

export interface answerQuestionnaireServiceDTO {
  process: 'onboarding';
  answers: answerDTO[];
}

export interface answerQuestionServiceDTO {
  question: number;
  choice: boolean;
}

export interface addOrganisationOfficerDTO {
  firstName: string;
  lastName: string;
  job_title?: string;
  dob?: string;
  nationality?: string;
  email: string;
  type?: string;
  phone_number: {
    localFormat: string;
    countryCode: string;
  };
  user: IUser;
  school: Partial<ISchools>;
  organisation: Partial<IOrganisation>;
  documents?: any;
  country: 'UGANDA' | 'NIGERIA';
}

export interface updateOrganisationOfficerDTO {
  firstName?: string;
  lastName?: string;
  officerCode?: string;
  job_title?: string;
  dob?: string;
  nationality?: string;
  email?: string;
  type?: string;
  phone_number: {
    localFormat: string;
    countryCode: string;
  };
  user: IUser;
  school: Partial<ISchools>;
  documents?: any;
}
