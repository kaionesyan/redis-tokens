import IORedis, { Redis } from 'ioredis';
import { randomBytes } from 'crypto';
import { CreateTokenDto } from './dtos/create-token.dto';
import { Token } from './models/token.model';
import { GetTokenDto } from './dtos/get-token.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { UpdateTokenDto } from './dtos/update-token.dto';
import { DeleteTokenDto } from './dtos/delete-token.dto';
import { DeleteAllTokensDto } from './dtos/delete-all-tokens.dto';

export class RedisTokens {
  client: Redis;

  constructor(connectionString?: string) {
    this.client = new IORedis(connectionString);
  }

  async create({
    app,
    type,
    owner,
    data,
    customToken,
    duration,
  }: CreateTokenDto): Promise<Token | undefined> {
    try {
      const token = new Token({
        app,
        type,
        owner,
        data: data || {},
        token: customToken || randomBytes(128).toString('base64url'),
      });

      const key = `app:${app}|type:${type}|owner:${owner}|token:${token.token}`;

      const stringifiedData = JSON.stringify(token.data);

      const redisResponse = await (duration
        ? this.client.set(key, stringifiedData, 'ex', duration)
        : this.client.set(key, stringifiedData));

      if (redisResponse === 'OK') {
        return token;
      }

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  async get({ app, type, token }: GetTokenDto): Promise<Token | undefined> {
    try {
      const pattern = `app:${app}|type:${type}*token:${token}`;
      const keys = await this.client.keys(pattern);

      if (keys.length === 0) return undefined;

      const key = keys[0];
      const data = await this.client.get(key);

      if (!data) return undefined;

      const owner = key.split('owner:')[1].split('|token')[0];
      const parsedData = data === '{}' ? {} : JSON.parse(data);

      return new Token({
        app,
        type,
        owner,
        data: parsedData,
        token,
      });
    } catch (error) {
      return undefined;
    }
  }

  async refresh({
    app,
    type,
    token,
    duration,
  }: RefreshTokenDto): Promise<void> {
    try {
      const pattern = `app:${app}|type:${type}*token:${token}`;
      const keys = await this.client.keys(pattern);

      if (keys.length === 0) return undefined;

      const key = keys[0];

      this.client.expire(key, duration);

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  async update({
    app,
    type,
    token,
    data,
  }: UpdateTokenDto): Promise<Token | undefined> {
    try {
      const pattern = `app:${app}|type:${type}*token:${token}`;
      const keys = await this.client.keys(pattern);

      if (keys.length === 0) return undefined;

      const key = keys[0];
      const currentData = await this.client.get(key);

      if (!currentData) return undefined;

      const owner = key.split('owner:')[1].split('|token')[0];

      const parsedCurrentData = JSON.parse(currentData);

      Object.keys(data).forEach(k => {
        if (data[k] === null) {
          delete parsedCurrentData[k];
        } else {
          parsedCurrentData[k] = data[k];
        }
      });

      await this.client.set(key, JSON.stringify(parsedCurrentData), 'keepttl');

      return new Token({
        app,
        type,
        owner,
        data: parsedCurrentData,
        token,
      });
    } catch (error) {
      return undefined;
    }
  }

  async delete({ app, type, token }: DeleteTokenDto): Promise<void> {
    try {
      const pattern = `app:${app}|type:${type}*token:${token}`;
      const keys = await this.client.keys(pattern);

      if (keys.length === 0) return undefined;

      const key = keys[0];

      await this.client.expire(key, 0);

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  async deleteAll({ app, type, owner }: DeleteAllTokensDto): Promise<void> {
    try {
      const pattern = `app:${app}|type:${type}|owner:${owner}*`;
      const keys = await this.client.keys(pattern);

      await Promise.all(
        keys.map(async key => {
          await this.client.expire(key, 0);
        }),
      );

      return undefined;
    } catch (error) {
      return undefined;
    }
  }
}
