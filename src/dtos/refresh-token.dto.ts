export interface RefreshTokenDto {
  app: string;
  type: string;
  token: string;
  duration: number;
}
