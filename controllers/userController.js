const User = require('../models/user');
const { StatusCodes } = require("http-status-codes")
const {BadRequestError,UnauthenticatedError,UnauthorizedError,NotFoundError} = require('../errors');
const {createTokenUser, attachCookiesToResponse, checkPermissions} = require('../utils');

const getAllUsers = async(req,res)=>{
  const users = await User.find({role:'user'}).select('-password');
  res.status(StatusCodes.OK).json({users});
}

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async(req,res)=>{
  res.status(StatusCodes.OK).json({user:req.user});
}

const updateUser = async(req,res)=>{
  const {name, email} = req.body;
  if(!name || !email){
    throw new BadRequestError('Please provide both name and email to proceed.');
  }
  const user = await User.findOneAndUpdate(
    {_id:req.user.userId},
    {name,email},
    {new:true,runValidators:true}
  );
  const payload = createTokenUser(user);
  attachCookiesToResponse({res,payload});
  res.status(StatusCodes.OK).json({user:payload});
}

const updateUserPassword = async(req,res)=>{
  const {newPassword, oldPassword} = req.body;
  if(!oldPassword || !newPassword){
    throw new BadRequestError('Please provide both old and new passwords to proceed.');
  }
  const user = await User.findOne({_id:req.user.userId});
  let isOldPasswordCorrect = await user.comparePassword(oldPassword);
  if(!isOldPasswordCorrect){
    throw new UnauthorizedError('Invalid crendentials');
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({msg:'Password updated.'});
}

module.exports = {
  getAllUsers,getSingleUser,showCurrentUser,updateUser,updateUserPassword
}