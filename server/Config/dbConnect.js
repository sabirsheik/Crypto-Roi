import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI).then(() => {
            console.log("Databsae Server Connected");
          })
          .catch((error) => {
            console.log("Database connection failed", error.message);
          });
    } catch (error) {
        console.log(error);
    }
};
export default dbConnect;