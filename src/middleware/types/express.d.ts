declare namespace Express {
  export interface Request {
    userId: string;
    user: {
      id: number;
      email: string;
      password: string;
      phone_number: number;
      first_name: string;
      last_name: string;
      enabled: boolean;
      is_business: boolean;
      created_at: Date;
      updated_at: Date;
    };
  }
}

declare namespace IQuiz {
  export interface questions {
    _id: string;
  }
}
