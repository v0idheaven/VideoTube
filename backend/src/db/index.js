
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const rawMongoUri = process.env.MONGODB_URI?.trim();

        if (!rawMongoUri) {
            throw new Error("MONGODB_URI is not defined");
        }

        let connectionUri = rawMongoUri;

        try {
            const mongoUrl = new URL(rawMongoUri);

            if (!mongoUrl.pathname || mongoUrl.pathname === "/") {
                mongoUrl.pathname = `/${DB_NAME}`;
            }

            connectionUri = mongoUrl.toString();
        } catch {
            if (!rawMongoUri.endsWith(`/${DB_NAME}`)) {
                connectionUri = `${rawMongoUri.replace(/\/+$/, "")}/${DB_NAME}`;
            }
        }

        const connectionInstance = await mongoose.connect(connectionUri)
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB
