import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient({ host: 'localhost', port: 6379 });

await client.connect();

client.on('error', (err) => {
  console.error(`Redis Error: ${err}`);
});

const existsAsync = promisify(client.hExists).bind(client);
const hsetAsync = promisify(client.hSet).bind(client);
const hgetAsync = promisify(client.hGet).bind(client);
const hgetAllAsync = promisify(client.hGetAll).bind(client);
const hdelAsync = promisify(client.hDel).bind(client);

export const  containsKey = async(key)=> {
  return await client.EXISTS(key);
}

export async function setHashToValue(key, strValue, etag) {
  await client.hSet(key, strValue, etag);
}

export async function getHashByKey(key, field) {
  return await hgetAsync(key, field);
}

export async function getObj(key) {
  return await client.hGetAll(key);
}

export async function delObj(key) {
  await client.del(key);
}

