import app from "./app/app.js";
import { establishElasticConnection } from "./app/utils/elasticFunctions.js";
import { startQueueListener } from "./app/utils/receiver.js";

const port = 9000;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    startQueueListener();
    establishElasticConnection();
});
