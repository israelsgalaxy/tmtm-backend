const mongoose = require('mongoose');
require('dotenv').config()

// connect to mongodb
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_DB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
.then(() => {console.log('Connected to MongoDB');})
.catch((err) => {console.log('Error connecting to MongoDB', err);})

// export the mongoose object
module.exports = mongoose;