
# Redis Tokens

A compact redis token manager that lets you create, fetch, update, refresh and delete tokens and their associated data


## Reference

#### Instantiate the RedisTokens client

```typescript
  import { RedisTokens } from 'redis-tokens';

  // You can pass an optional connection string here
  const redisTokens = new RedisTokens('redis://localhost:6379');
```

#### Create a token

```typescript
  const token = await redisTokens.create({
    app: 'my-app',
    type: 'user-session',
    owner: 'abc',
    data: {
      something: 'here'
    },
    duration: 60 * 60 * 24 * 7
  });
```

Optionally pass in a manually generated token

```typescript
  const myToken = myTokenGeneratorFunction();
  const token = await redisTokens.create({
    app: 'my-app',
    type: 'user-session',
    owner: 'abc',
    data: {
      something: 'here'
    },
    duration: 60 * 60 * 24 * 7,
    customToken: myToken
  });
```

#### Get a token

```typescript
  const token = await redisTokens.get({
    app: 'my-app',
    type: 'user-session',
    token: 'token'
  });
```

#### Refresh a token

```typescript
  await redisTokens.refresh({
    app: 'my-app',
    type: 'user-session',
    token: 'token',
    duration: 60 * 60 * 24 * 7
  });
```

#### Update a token

* Values sent as null will be deleted if they exist
* Undefined values are ignored
* Other values are inserted into the token data

```typescript
  const token = await redisTokens.update({
    app: 'my-app',
    type: 'user-session',
    token: 'token',
    data: {
      insertThis: 'kaionesyan',
      deleteThis: null,
      doNothing: undefined
    }
  });
```

#### Delete a token

```typescript
  await redisTokens.delete({
    app: 'my-app',
    type: 'user-session',
    token: 'token'
  });
```

#### Delete all tokens of an owner

```typescript
  await redisTokens.deleteAll({
    app: 'my-app',
    type: 'user-session',
    owner: 'abc'
  });
```
## Going Further

The native IORedis client is exposed inside the RedisTokens class, should you wish to perform other kinds of operations.


## Authors

- [kaionesyan](https://www.github.com/kaionesyan)


## Contributing

Contributions are always welcome!
