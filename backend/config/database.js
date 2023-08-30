const mongoose = require('mongoose');

exports.connectDatabase = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    } catch (err) {
        console.error(err);
    }
};



// exports.connectDatabase = () => {
//     mongoose.connect(process.env.MONGO_URI)
//     .then(con => {
//         console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
//     }).catch((err) =>{
//         console.log(err);
//     })
// }