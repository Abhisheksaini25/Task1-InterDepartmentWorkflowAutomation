const app = require('../app');
const connectDb = require('../src/config/db');

module.exports = async (req, res) => {
    await connectDb();
    return app(req, res);
};
