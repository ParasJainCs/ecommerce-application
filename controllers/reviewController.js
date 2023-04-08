const Product = require('../models/product');
const Review = require('../models/review');
const { StatusCodes } = require("http-status-codes")
const {BadRequestError,UnauthenticatedError,UnauthorizedError,NotFoundError} = require('../errors');
const {checkPermissions} = require('../utils');

const createReview = async(req,res)=>{
  const {product:productId} = req.body;
  const isValidProduct = await Product.findOne({_id:productId});
  if(!isValidProduct){
    throw new NotFoundError(`No product with id : ${productId}`);
  }
  const alreadyExists = await Review.findOne({product:productId,user:req.user.userId});
  if(alreadyExists){
    throw new BadRequestError('Review already exists.');
  }
  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({review});
}

const getAllReviews = async(req,res)=>{
  const reviews = await Review.find({}).populate({
    path:'product',
    select:'name company price'
  });
  res.status(StatusCodes.OK).json({reviews,count:reviews.length});
}

const getSingleReview = async(req,res)=>{
  const {id:reviewId} = req.params;
  const review = await Review.findOne({_id:reviewId});
  if(!review){
    throw new NotFoundError(`No review with id : ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({review});
}

const updateReview = async(req,res)=>{
  const {id:reviewId} = req.params;
  const review = await Review.findOne({_id:reviewId});
  if(!review){
    throw new NotFoundError(`No review with id : ${reviewId}`);
  }
  checkPermissions(req.user, review.user);
  const {rating, title, comment} = req.body;
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  await review.save();
  res.status(StatusCodes.OK).json({review});
}

const deleteReview = async(req,res)=>{
  const {id:reviewId} = req.params;
  const review = await Review.findOne({_id:reviewId});
  if(!review){
    throw new NotFoundError(`No review with id : ${id}`);
  }
  checkPermissions(req.user, review.user);
  await Review.remove();
  res.status(StatusCodes.OK).json({msg:"Success! Review removed."});
}

const getSingleProductReviews = async(req,res)=>{
  const {id:productId} = req.params;
  const reviews = await Review.find({product:productId});
  res.status(StatusCodes.OK).json({reviews,count:reviews.length});
};

module.exports = {
  createReview, 
  getAllReviews, 
  getSingleReview, 
  updateReview, 
  deleteReview,
  getSingleProductReviews
}