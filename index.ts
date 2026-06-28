export interface Mail {
  id: string;
  from: string;
  subject: string;
  body: string;
  preview?: string;
  timestamp?: string;
  date?: string;
  read?: boolean;
}

export interface ApiResponse {
  status: boolean;
  message?: string;
  data?: Mail[];
}