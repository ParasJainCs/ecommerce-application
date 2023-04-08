const mongoose = require('mongoose');

const SingleOrderItemSchema = mongoose.Schema(
  {
    name:{
      type:String,
      required:true
    },
    image:{
      type:String,
      required:true
    },
    price:{
      type:Number,
      required:true
    },
    amount:{
      type:Number,
      required:true
    },
    product:{
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    }
  }
);

const OrderSchema = mongoose.Schema(
  {
    tax: {
      type: Number,
      required: [true, 'Please provide tax.'],
    },
    shippingFee: {
      type: Number,
      required: [true, 'Please provide shippingFee.'],
    },
    orderItems:[SingleOrderItemSchema],
    subtotal: {
      type: Number,
      required: [true, 'Please provide subtotal.'],
    },
    total: {
      type: Number,
      required: [true, 'Please provide total.'],
    },
    status: {
      type: String,
      enum:['pending','failed','paid','delivered','cancelled'],
      default:'pending'
    },
    clientSecret: {
      type: String,
      required: [true, 'Please provide clientSecret.'],
    },
    paymentIntentId: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
