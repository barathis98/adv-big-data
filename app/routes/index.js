import insuranceRouter from "./insuranceRoute.js";

const route = (app)=>{
    app.use("/plan", insuranceRouter)
};

export default route;