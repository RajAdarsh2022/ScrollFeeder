const app = require("./app")
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
// const {connectDatabase} = require("./config/database");


//Connecting to database
connectDatabase = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    } catch (err) {
        console.error(err);
    }
};
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})



          
