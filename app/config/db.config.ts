import { Sequelize } from "sequelize-typescript";
import { enviroments } from "./enviroments.config";
import { logger } from "@vigilio/express-core/helpers";

const sequelize = new Sequelize({
    dialect: "mysql",
    host: enviroments.DB_HOST,
    username: enviroments.DB_USER,
    password: enviroments.DB_PASS,
    database: enviroments.DB_NAME,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

sequelize.addModels([
    // here entities
]);

export async function connectDB() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        logger.success("database was connected succelly");
    } catch (error) {
        logger.error(`Cannot connect in database: ${error}`);
        process.exit(1);
    }
}
export { sequelize };
