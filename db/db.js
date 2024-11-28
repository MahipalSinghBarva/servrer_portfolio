const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

exports.databaseConnection = async () => {

    try {
        const connection = mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        }).then(() => {
            console.log("Database connected successfully");
        }).catch((err) => {
            console.log(err);
            process.exit();
        });
    } catch (err) {
        console.log("Error: ", err.message);
        throw err;
        return;
    }

};