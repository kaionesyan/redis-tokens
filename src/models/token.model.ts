export class Token {
  app: string;

  type: string;

  owner: string;

  data: Record<string, any>;

  token: string;

  constructor({ app, type, owner, data, token }: Token) {
    this.app = app;
    this.type = type;
    this.owner = owner;
    this.data = data;
    this.token = token;
  }
}
