export interface UpdateTokenDto {
  app: string;
  type: string;
  token: string;
  data: Record<string, any>;
}
