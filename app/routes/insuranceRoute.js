import * as ic from '../controller/insurance-controller.js';
import express from 'express';

const insuranceRouter = express.Router();

insuranceRouter.route('/:objectId')
    .get(ic.getPlanById)
    .delete(ic.deletePlan)

insuranceRouter.route('/')
    .post(ic.postPlan)

insuranceRouter.route('*')
    .all((req, res) => {
        res.status(404).send('Invalid path');
    });

export default insuranceRouter;
