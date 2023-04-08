const User = require('../models/user');
const Product = require('../models/product');
const path = require('path');
const { StatusCodes } = require("http-status-codes")
const {BadRequestError,UnauthenticatedError,UnauthorizedError,NotFoundError} = require('../errors');

const createProduct = async(req,res)=>{
  const {
    name,
    price,
    description,
    category,
    company,
    colors,
    inventory
  } = req.body;
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);  
  res.status(StatusCodes.CREATED).json({product});
}

const getAllProducts = async(req,res)=>{
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({products,count:products.length});
}

const getSingleProduct = async(req,res)=>{
  const {id} = req.params;
  const product = await Product.findOne({_id:id});
  // Alternative syntax to get all reviews but it has query issues because it is getting created on the fly.
  // const product = await Product.findOne({_id:id}).populate('reviews');
  if(!product){
    throw new NotFoundError(`No product with id : ${id}`);
  }
  res.status(StatusCodes.OK).json({product});
}

const updateProduct = async(req,res)=>{
  const {id} = req.params;
  const product = await Product.findOneAndUpdate(
    {_id:id},
    req.body,
    {new:true,runValidators:true});
  if(!product){
    throw new NotFoundError(`No product with id : ${id}`);
  }
  res.status(StatusCodes.OK).json({product});
}

const deleteProduct = async(req,res)=>{
  const {id} = req.params;
  const product = await Product.findOne({_id:id});
  if(!product){
    throw new NotFoundError(`No product with id : ${id}`);
  }
  await product.remove();
  res.status(StatusCodes.OK).json({msg:"Success! Product removed."});
}

const uploadImage = async(req,res)=>{
  // res.status(StatusCodes.OK).json({});
  if(!req.files){
    throw new BadRequestError('No file uploaded.');
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image');
  }
  const maxSize = 1024*1024*100;
  if(productImage.size>maxSize){
    throw new BadRequestError('Upload image smaller than 1Mb.');
  }
  const imagePath = path.join(__dirname,`../public/uploads/${productImage.name}`);
  await productImage.mv(imagePath); 
  res.status(StatusCodes.OK).json({image:`/uploads/${productImage.name}`});
}

module.exports = {
  createProduct, 
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage
}