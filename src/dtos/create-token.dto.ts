export interface CreateTokenDto {
  app: string;
  type: string;
  owner: string;
  data?: Record<string, any>;
  customToken?: string;
  duration?: number;
}
