import md5 from "md5";
import * as insuranceRedis from './insurance-redis.js';


export const postPlan = async (plan) => {
    const eTag = md5(JSON.stringify(plan));

    const planId = `${plan.objectType}-${plan.objectId}`;
    await insuranceRedis.setHashToValue(planId, JSON.stringify(plan), eTag);


    const planCostSharesId = `${plan.planCostShares.objectType}-${plan.planCostShares.objectId}`;
    await insuranceRedis.setHashToValue(planCostSharesId, JSON.stringify(plan.planCostShares), eTag);

    const planServices = plan.linkedPlanServices || [];
    for (const node of planServices) {
        if (node) {
            const nodeKey = `${node.objectType}-${node.objectId}`;
            await insuranceRedis.setHashToValue(nodeKey, JSON.stringify(node), eTag);

            for (const [key, value] of Object.entries(node)) {
                if (key === 'linkedService') {
                    const linkedServiceNode = value;
                    await insuranceRedis.setHashToValue(`${linkedServiceNode.objectType}-${linkedServiceNode.objectId}`, JSON.stringify(linkedServiceNode), eTag);
                }

                if (key === 'planserviceCostShares') {
                    const planserviceCostSharesNode = value;
                    await insuranceRedis.setHashToValue(`${planserviceCostSharesNode.objectType}-${planserviceCostSharesNode.objectId}`, JSON.stringify(planserviceCostSharesNode), eTag);
                }
            }
        }
    }

    return eTag;
};


export const getPlan = async (objectId) => {
    return await insuranceRedis.getObj(objectId);
}

export const getHashByKey = async (objectId) => {
    return await insuranceRedis.getHashByKey(objectId, 'eTag');
}

export const getAll = async () => {
    return await insuranceRedis.getAll();
}



export const deletePlan = async(rootNode) => {
    console.log('rootNode:', rootNode);
    const planCostSharesNode = rootNode.planCostShares;
    const planCostSharesId = `${planCostSharesNode.objectType}-${planCostSharesNode.objectId}`;
    console.log(planCostSharesId);
    await insuranceRedis.delObj(planCostSharesId);  
    const planServices = rootNode.linkedPlanServices || [];
    planServices.forEach((node) => {
        if (node) {
            const nodeKey = `${node.objectType}-${node.objectId}`;
            insuranceRedis.delObj(nodeKey);

            for (const [key, value] of Object.entries(node)) {
                if (key === 'linkedService') {
                    const linkedServiceNode = value;
                    insuranceRedis.delObj(`${linkedServiceNode.objectType}-${linkedServiceNode.objectId}`);
                }

                if (key === 'planserviceCostShares') {
                    const planserviceCostSharesNode = value;
                    insuranceRedis.delObj(`${planserviceCostSharesNode.objectType}-${planserviceCostSharesNode.objectId}`);

                }
            }
        }
    });
    insuranceRedis.delObj('plan-'+rootNode.objectId)
};

export const updatePlan = async (newPlan, oldPlan) => {

    const uniqueObjectIds = new Set();

    const mergedPlanCostShares = {
        ...oldPlan.planCostShares,
        ...newPlan.planCostShares
    };

    

    const mergedPlanServices = mergePlanEntities(newPlan.linkedPlanServices, oldPlan.linkedPlanServices, uniqueObjectIds);

    const updatedPlan = {
        ...oldPlan,
        ...newPlan,
        planCostShares: mergedPlanCostShares,
        linkedPlanServices: mergedPlanServices
    };

    const eTag = md5(JSON.stringify(updatedPlan));

    await postPlan(updatedPlan);
    return eTag;
};

const mergePlanEntities = (newEntities, oldEntities, uniqueObjectIds) => {
    newEntities = Array.isArray(newEntities) ? newEntities : [];
    oldEntities = Array.isArray(oldEntities) ? oldEntities : [];

    const mergedEntities = [];

    newEntities.forEach(entity => {
        if (entity.objectId && !uniqueObjectIds.has(entity.objectId)) {
            uniqueObjectIds.add(entity.objectId);
            mergedEntities.push(entity);
        }
    });

    oldEntities.forEach(entity => {
        console.log(oldEntities)
        console.log('ENTITY:', entity.objectId );
        if (entity.objectId && !uniqueObjectIds.has(entity.objectId)) {
            uniqueObjectIds.add(entity.objectId);
            mergedEntities.push(entity);
        }
    });

    return mergedEntities;
};



