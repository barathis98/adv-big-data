import insuranceRouter from "./insuranceRoute.js";
import {oAuth} from '../middleware/oAuth.js'

const route = (app)=>{
    app.use("/v1/plan", oAuth,insuranceRouter)
};

export default route;