import md5 from "md5";
import * as insuranceRedis from './insurance-redis.js';

export const postPlan = async (plan) => {
    const eTag = md5(JSON.stringify(plan));
    console.log("eTag: ", eTag);
    console.log("objectId:",plan.objectId)
    await insuranceRedis.setHashToValue(plan.objectId, JSON.stringify(plan), eTag);
    return eTag;
};

export const getPlan = async (objectId) => {
    return await insuranceRedis.getObj(objectId);
}

export const deletePlan = async (objectId) => {
    return await insuranceRedis.delObj(objectId);
}

// export const 