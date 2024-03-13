import * as ic from '../controller/insurance-controller.js';
import express from 'express';
import {  conditionalRead } from '../middleware/cache.js';
import {conditionalWrite} from '../middleware/cache.js'

const insuranceRouter = express.Router();

insuranceRouter.route('/:objectId')
    .get(conditionalRead,ic.getPlanById)
    .delete(ic.deletePlan)
    .patch(conditionalWrite,ic.patchPlan);

insuranceRouter.route('/')
    .post(ic.postPlan)
    .get(ic.getAll)

insuranceRouter.route('*')
    .all((req, res) => {
        res.status(404).send('Invalid path');
    });

export default insuranceRouter;
