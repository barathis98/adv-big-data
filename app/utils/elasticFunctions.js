import { Client } from '@elastic/elasticsearch';
import fs from 'fs';

let esClient; 
let mapOfDocuments = new Map();
let listOfKeys = [];



let  indexMapping = {
  mappings: {
    properties: {
      plan: {
        properties: {
          _org: { type: 'text' },
          objectId: { type: 'keyword' },
          objectType: { type: 'text' },
          planType: { type: 'text' },
          creationDate: { type: 'date', format: 'MM-dd-yyyy' },
        },
      },
      planCostShares: {
        properties: {
          copay: { type: 'long' },
          deductible: { type: 'long' },
          _org: { type: 'text' },
          objectId: { type: 'keyword' },
          objectType: { type: 'text' },
        },
      },
      linkedPlanServices: {
        type: 'nested', 
        properties: {
          _org: { type: 'text' },
          objectId: { type: 'keyword' },
          objectType: { type: 'text' },
        },
      },
      linkedService: {
        properties: {
          _org: { type: 'text' },
          name: { type: 'text' },
          objectId: { type: 'keyword' },
          objectType: { type: 'text' },
        },
      },
      planserviceCostShares: {
        properties: {
          copay: { type: 'long' },
          deductible: { type: 'long' },
          _org: { type: 'text' },
          objectId: { type: 'keyword' },
          objectType: { type: 'text' },
        },
      },
      plan_join: {
        type: 'join',
        eager_global_ordinals: true,
        relations: {
          plan: ['planCostShares', 'linkedPlanServices'],
          linkedPlanServices: ['linkedService', 'planserviceCostShares'],
        },
      },
    },
  },
};

export async function establishElasticConnection() {
  try {
    const port = 9200;
    const index = 'insurance';

    esClient = new Client({
        node: 'https://elastic:8jsMJ6cXV8fvGh3ekfCI@localhost:9200/',
        tls: { 
            ca: fs.readFileSync('../../http_ca.crt'),
            rejectUnauthorized: false  ,

        }
      });  
      const indexExists = await esClient.indices.exists({ index: 'insurance' }); 
      console.log(`Index ${index} exists: ${indexExists}`);
      if (indexExists) {
        console.log(`Index ${index} already exists`);
        return;
      }
      else{
      await createIndex(index);
      }
     console.log(`Elasticsearch connection established successfully on port ${port}`);
  } catch (error) {
    console.error('Error establishing Elasticsearch connection:', error);
    throw error;
  }
}

async function createIndex(indexName) {
    try {
      const response= await esClient.indices.create({ index: indexName,body: indexMapping});
      console.log(`Index created: ${response.index}`);
      return true;
      
    } catch (error) {
      console.error('Error creating index:', error);
      throw error;
    }
  }


export async function save(index, plan) {
  try {
    mapOfDocuments = new Map();
    convertMapToDocumentIndex(plan, "", "plan");
    console.log("map of documents",mapOfDocuments);

    for (let [key, value] of mapOfDocuments.entries()) {
      const keyParts = key.split(':');
      const parentId = keyParts[0];
      const objectId = keyParts[1];
      const indexRequest = {
        index: index,
        id: objectId,
        body: value,
        routing: parentId,
        refresh: 'true'
      };

       const { body: indexResponse } = await esClient.index(indexRequest);
    }
  } catch (error) {
    console.error('Failed to post document:', error);
  }
}

export async function deleteDocument(index,json) {
  try {
    const jsonObject = JSON.parse(json);
    console.log("inside delete document");
    convertToKeys(jsonObject);
  
    for (const key of listOfKeys) {
      const deleteResponse = await esClient.delete({
        index: index,
        id: key
      });

      if (deleteResponse.result === 'not_found') {
        console.log(`Document ${key} Not Found!!`);
      }
    }
  } catch (error) {
    console.error('Failed to delete document:', error);
  }
}

function convertToKeys(jsonObject) {
  let map = new Map();
  let valueMap = {};

  for (const key in jsonObject) {
    if (!jsonObject.hasOwnProperty(key)) continue;

    let redisKey = jsonObject['objectId'].toString();
    let value = jsonObject[key];

    if (value instanceof Array) {
      convertToKeysList(value);
    } else if (value instanceof Object) {
      convertToKeys(value);
    } else {
      valueMap[key] = value;
      map.set(redisKey, valueMap);
    }
  }

  listOfKeys.push(jsonObject['objectId'].toString());
  return map;
}

function convertToKeysList(jsonArray) {
  let list = [];
  jsonArray.forEach(value => {
    if (Array.isArray(value)) {
      value = convertToKeysList(value);
    } else if (value instanceof Object) {
      value = convertToKeys(value);
    }
    list.push(value);
  });
  return list;
}



function convertMapToDocumentIndex(jsonObject, parentId, objectName) {
  let map = new Map();
  let valueMap = {};

  for (let key of Object.keys(jsonObject)) {
    let redisKey = jsonObject['objectType'] + ":" + parentId;
    let value = jsonObject[key];

    if (value instanceof Object && !Array.isArray(value)) {
      convertMapToDocumentIndex(value, jsonObject['objectId'].toString(), key);
    } else if (Array.isArray(value)) {
      convertToList(value, jsonObject['objectId'].toString(), key);
    } else {
      valueMap[key] = value;
      map.set(redisKey, valueMap);
    }
  }

  let temp = {};
  if (objectName === "plan") {
    valueMap['plan_join'] = objectName;
  } else {
    temp['name'] = objectName;
    temp['parent'] = parentId;
    valueMap['plan_join'] = temp;
  }

  let id = parentId + ":" + jsonObject['objectId'].toString();
  mapOfDocuments.set(id, valueMap);

  return map;
}

function convertToList(array, parentId, objectName) {
  let list = [];
  array.forEach((item) => {
      let value = item;
      if (Array.isArray(value)) {
          value = convertToList(value, parentId, objectName);
      } else if (value instanceof Object && !Array.isArray(value)) {
          value = convertMapToDocumentIndex(value, parentId, objectName);
      }
      list.push(value);
  });
  return list;
}




