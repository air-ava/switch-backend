declare namespace Express {
  export interface Request {
    userId: string;
    user: {
      id: string;
      email: string;
      password: string;
      user_type: string;
      business_name: string;
      country: string;
      phone_number: number;
      first_name: string;
      last_name: string;
      organisation: number;
      // enabled: boolean;
      // is_business: boolean;
      created_at: Date;
      updated_at?: Date;
    };
    organisation: {
      id: string;
      name: string;
      email: string;
      bio: string;
      status: number;
      logo: string;
      type: string;
      phone_number: string;
      owner: string;
      slug: string;
      onboarding_reference?: string;
      document_reference?: string;
      created_at: Date;
      updated_at: Date;
    };
    school: {
      id: string;
      country: string;
      state: string;
      name: string;
      education_level: string;
      email: string;
      description: string;
      document_reference: string;
      website: string;
      status: number;
      logo: any;
      Logo?: any;
      organisation_id?: number;
      phone_number?: number;
      address_id?: number;
      created_at: Date;
      updated_at: Date;
    };
    backOfficeUser: {
      id: number;
      email: string;
      name: string;
      slug: string;
      role: string;
      remember_token: string | null;
      password: string;
      avatar: number;
      status: number;
      created_at: Date;
      email_verified_at?: Date;
      updated_at?: Date;
    };
    deviceInfo: any;
    ipAddress: any;
    educationalSession?: Partial<{
      id: number;
      code: string;
      session: string;
      country: string;
      schedule_id: number;
      name: string;
      status: number;
      start_date: Date;
      expiry_date: Date | null;
      created_at: Date;
      updated_at: Date;
    }>;
    guardian?: Partial<{
      id: number;
      firstName: string;
      lastName: string;
      nationality: string;
      dob?: Date;
      email: string;
      gender: 'male' | 'female' | 'others';
      type: string;
      avatar: number;
      job_title: number;
      status: number;
      verification_status: number;
      document_reference: string;
      onboarding_reference: string;
      username: string;
      metadata: string;
      school_id: number;
      phone_number: number;
      address_id: number;
      created_at: Date;
      updated_at: Date;
    }>;
    student?: {
      id: number;
      schoolId: number;
      uniqueStudentId: string;
      userId: string;
      status: number;
      paymentTypeId: number;
      defaultEmail: boolean;
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
