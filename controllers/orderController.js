const Product = require('../models/product');
const Order = require('../models/order');

const { StatusCodes } = require("http-status-codes")
const {BadRequestError,UnauthenticatedError,UnauthorizedError,NotFoundError} = require('../errors');
const {checkPermissions} = require('../utils');

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount };
};

const createOrder = async(req,res)=>{
  const {items:cartItems,tax,shippingFee} = req.body;
  if(!cartItems || cartItems.length<1){
    throw new BadRequestError('Cart can not be empty while placing an order.'); 
  }
  if(!tax || !shippingFee){
    throw new BadRequestError('Please provide both tax and shipping fee.'); 
  }

  let orderItems = [];
  let subtotal = 0;

  for(const item of cartItems){
    const dbProduct = await Product.findOne({_id:item.product});
    if(!dbProduct){
      throw new NotFoundError(`No product with id : ${item.product}`);
    }
    const {name,price,image,_id} = dbProduct;
    const singleOrderItem = {
      amount:item.amount,
      name,price,image,
      product:_id
    };
    // add item to orders.
    orderItems = [...orderItems,singleOrderItem];
    // calculate subtotal
    subtotal += item.amount * price;
  }
  // calculate total
  const total = tax + shippingFee + subtotal;
  // get client secret
  const paymentIntent = await fakeStripeAPI({
    amount:total,
    currency:'USD'
  });
  // create order
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret:paymentIntent.client_secret,
    user:req.user.userId
  });
  res.status(StatusCodes.CREATED).json({order,clientSecret:order.clientSecret});
  // res.send('order created');
}

const getAllOrders = async(req,res)=>{
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({orders,count:orders.length});
}

const getSingleOrder = async(req,res)=>{
  const {id:orderId} = req.params;
  const order = await Order.findOne({_id:orderId});
  if(!order){
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user,order.user);
  res.status(StatusCodes.OK).json({order});
}

const updateOrder = async(req,res)=>{
  const {id:orderId} = req.params;
  const {paymentIntentId} = req.body;
  const order = await Order.findOne({_id:orderId});
  if(!order){
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user,order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();
  res.status(StatusCodes.OK).json({order});
}

const getCurrentUserOrders = async(req,res)=>{
  const orders = await Order.find({user:req.user.userId});
  res.status(StatusCodes.OK).json({orders,count:orders.length});
};

module.exports = {
  getAllOrders, 
  getSingleOrder, 
  getCurrentUserOrders,
  createOrder, 
  updateOrder
}