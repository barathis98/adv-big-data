import { validateJsonObject } from '../utils/schemaValidator.js';
import * as insuranceService from '../service/insurance-service.js';   
import * as insuranceRedis from '../service/insurance-redis.js';
import md5 from 'md5';


export const postPlan = async (req, res,next) => {
    if (req.body === undefined || req.body === null) {
        res.status(400).send('Request body is empty');
    }



        if (await validateJsonObject(req.body)) {
            const objectId = req.body.objectId;
            const type = req.body.objectType;


            const key = type +'-' +objectId;
            console.log("key",key);

            if (await insuranceRedis.containsKey(key)) {
                res.status(409).send('Plan already exists');
                return;
            }

        const eTag = await insuranceService.postPlan(req.body);
        res.setHeader('ETag', eTag);
        res.status(201).send('Plan created');
        }
        else {
            res.status(400).send('Invalid format');
        }
    
}

export const getPlanById = async (req, res) => {
    const key = 'plan-'+req.params.objectId;

        if (await insuranceRedis.containsKey(key)) {
            const plan = await insuranceService.getPlan(key);
            res.status(200).send(plan);
    }
    else {
        res.status(404).send('Plan not found');
    }

}

export const getAll = async(req, res) => {
    const plans = await insuranceService.getAll();
    if (!plans || plans.length === 0) {
        res.status(404).send('No plans found');
    }
    else{
    res.status(200).send(plans);
    }
    

}

export const deletePlan = async (req, res) => {
    const key = 'plan-'+req.params.objectId;
    console.log("objectIdL",key)
    if (await insuranceRedis.containsKey(key)) {
        const plan = await insuranceService.getPlan(key);
        const rootNode = JSON.parse(plan);
        await insuranceService.deletePlan(rootNode);
        res.status(204).send('Plan deleted');
    }
    else {
        res.status(404).send('Plan not found');
    }
}

export const patchPlan = async(req,res) => {
    const key = 'plan-'+req.params.objectId;
    if (await insuranceRedis.containsKey(key)) {
        let plan = await insuranceService.getPlan(key);
        console.log("plan",plan)
        if (await validateJsonObject(req.body)) {
            plan = JSON.parse(plan);
            const updatedPlan = req.body;

           const eTag =  await insuranceService.updatePlan(updatedPlan,plan);
           res.setHeader('ETag', eTag);
        }
        else {
            res.status(400).send('Invalid format');
        }
        res.status(200).send('Plan updated');
    }
    else {
        res.status(404).send('Plan not found');
    }

}
