import insuranceRouter from "./insuranceRoute.js";

const route = (app)=>{
    app.use("/v1/plan", insuranceRouter)
};

export default route;