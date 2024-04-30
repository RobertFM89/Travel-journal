import { createConnection } from "mysql2/promise.js";
import { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, NODE_ENV} from '../../env.js';
import createSchema from "./create-schema.js";
import loadBaseData from "./load-base-data.js";
import loadDemoData from "./load-demo-data.js";

const initialDb = async () => {
  try {
    const db = await createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USERNAME,
      password: DB_PASSWORD
    })

    //crear el schema
    await createSchema(db);

    //crear datos base;
    await loadBaseData(db);

    //agregar datos demo
    if (NODE_ENV == "development") {
      await loadDemoData(db)
    }

    process.exit(0);

  } catch (error) {
    console.log(error)
    process.exit(1);
  }
};

initialDb();
