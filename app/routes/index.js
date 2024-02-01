import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient({ host: 'localhost', port: 6379 });

client.on('error', (err) => {
  console.error(`Redis Error: ${err}`);
});

const existsAsync = promisify(client.exists).bind(client);
const hsetAsync = promisify(client.hset).bind(client);
const hgetAsync = promisify(client.hget).bind(client);
const hgetAllAsync = promisify(client.hgetall).bind(client);
const hdelAsync = promisify(client.hdel).bind(client);

export async function containsKey(key) {
  return await existsAsync(key);
}

export async function setHashToValue(key, strValue, etag) {
  await hsetAsync(key, strValue, etag);
}

export async function getHashByKey(key, field) {
  return await hgetAsync(key, field);
}

export async function getObj(key) {
  return await hgetAllAsync(key);
}

export async function delObj(key, field) {
  await hdelAsync(key, field);
}
