import * as insuranceRedis from '../service/insurance-redis.js';
import md5 from "md5";
import * as insuranceService from '../service/insurance-service.js';   



export const cache = async(req, res, next) => {
    const eTag = req.headers['if-none-match'];
    if (!eTag) {
        console.log("No eTag present, proceeding...");
        return next();
    }
    const key = 'plan-'+req.params.objectId;
    const plan = await insuranceService.getPlan(key);
    console.log("inside cache")


    if (await insuranceRedis.containsKey(key)) {
        console.log("inside cache1")
        const calculatedeTag = md5(plan);
        console.log("calculatedeTag: ", calculatedeTag);
        console.log("eTag: ", eTag);
        if (eTag !== calculatedeTag) {
            return res.status(412).send({message: "Precondition Failed"});
        }
        if (calculatedeTag === eTag) {
            res.status(304).send('Not Modified');
            return;
        }
    }

    next();
}        