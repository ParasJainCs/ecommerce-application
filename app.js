// Importing env file's variables.
require('dotenv').config();

// Importing express-async-errors middleware.
// This middleware is used so that in our routes, we do not have to write try catch blocks.
require('express-async-errors');

// Creating a server.
const express = require('express');
const app = express();

// Importing and setting up middlewares.
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const morgan = require('morgan');//Used to log api requests.
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

app.set('trust proxy',1);
app.use(rateLimiter({
  windowMs:15*60*1000,
  max:60,
}));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./public'));
app.use(fileUpload());

// Importing and setting up routes.
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/products',productRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/orders', orderRouter);

// Using middlewares for errors or not found.
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Importing DB connection function.
const connectDB = require('./db/connect');

// Starting the server.
const port = process.env.PORT || 3000;
const start = async() => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, ()=>{
    console.log( `Server started at port ${port}.`);
  })
  } catch (error) {
    console.log('Error occured: ',error);
  }
}
start();