const app=require('./app')
require("dotenv").config();
const connectDb=require('./src/config/db')
const usermodel=require('./src/models/user')
const port =process.env.PORT
const bcrypt = require("bcryptjs");

const startServer = async () => {
  await connectDb();
  
  app.listen(port, () => console.log(`Server started at ${port}`));
};

startServer();

