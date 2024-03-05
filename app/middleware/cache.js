import * as insuranceRedis from '../service/insurance-redis.js';
import md5 from "md5";
import * as insuranceService from '../service/insurance-service.js';   



export const cache = async(req, res, next) => {
    const eTag = req.headers['if-none-match'];
    const key = req.params.objectId;
    const plan = await insuranceService.getPlan(key);
    console.log("inside cache")


    if (await insuranceRedis.containsKey(key)) {
        console.log("inside cache1")
        const calculatedeTag = md5(plan);
        console.log("calculatedeTag: ", calculatedeTag);
        console.log("eTag: ", eTag);
        if (calculatedeTag === eTag) {
            res.status(304).send('Not Modified');
            return;
        }
    }

    next();
}        