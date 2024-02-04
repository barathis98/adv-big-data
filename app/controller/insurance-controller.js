import { validateJsonObject } from '../utils/schemaValidator.js';
import * as insuranceService from '../service/insurance-service.js';   
import * as insuranceRedis from '../service/insurance-redis.js';


export const postPlan = async (req, res,next) => {
    if (req.body === undefined || req.body === null) {
        res.status(400).send('Request body is empty');
    }
    const key = req.body.objectId;

    if (await insuranceRedis.containsKey(key)) {
        res.status(409).send('Plan already exists');
    }
    else {
        if (await validateJsonObject(req.body)) {

        const eTag = await insuranceService.postPlan(req.body);
        res.setHeader('ETag', eTag);
        res.status(201).send('Plan created');
        }
        else {
            res.status(400).send('Invalid format');
        }
    }
}

export const getPlanById = async (req, res) => {
    const key = req.params.objectId;
    const ifNoneMatch = req.headers['if-none-match'];

        if (await insuranceRedis.containsKey(key)) {
            const plan = await insuranceService.getPlan(key);
            if (await insuranceRedis.getHashByKey(key) === ifNoneMatch){

                    res.status(304).send('Not Modified');
        }
        else {
            res.status(200).send(plan);
        }
    }
    else {
        res.status(404).send('Plan not found');
    }

}

export const getAll = async(req, res) => {
    const plans = await insuranceService.getAll();
    // console.log(plans)
    if (!plans || plans.length === 0) {
        res.status(404).send('No plans found');
    }
    else{
    res.status(200).send(plans);
    }
    

}

export const deletePlan = async (req, res) => {
    const key = req.params.objectId;
    console.log("objectIdL",key)
    if (await insuranceRedis.containsKey(key)) {
        await insuranceService.deletePlan(key);
        res.status(204).send('Plan deleted');
    }
    else {
        res.status(404).send('Plan not found');
    }
}

