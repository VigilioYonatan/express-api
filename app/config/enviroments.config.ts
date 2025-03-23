import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const environments = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    SECRET_JWT_KEY: process.env.SECRET_JWT_KEY,
};
export default environments;
