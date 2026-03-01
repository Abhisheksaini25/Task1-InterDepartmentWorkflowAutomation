const mongoose = require("mongoose");

let isConnected = false;

const connectDb = async () => {
    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log(`Mongodb connected at ${db.connection.host}`);
    } catch (error) {
        console.log(`Mongodb failed to connect  ${error}`);
        throw error;
    }
}

module.exports = connectDb;
