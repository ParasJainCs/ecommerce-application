const { StatusCodes } = require("http-status-codes")
const User = require('../models/user');
const {BadRequestError,UnauthenticatedError} = require('../errors');
const {createTokenUser,attachCookiesToResponse} = require('../utils');

const login = async(req,res)=>{
  const {email,password} = req.body;
  if(!email || !password){
    throw new BadRequestError('Please enter both username and password to login.');
  }
  const user = await User.findOne({email});
  if(!user){
    throw new UnauthenticatedError('Invalid credentials.');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if(!isPasswordCorrect){
    throw new UnauthenticatedError('Invalid credentials.');
  }
  const payload = createTokenUser(user);
  attachCookiesToResponse({res,payload});
  res.status(StatusCodes.OK).json({
    user:payload
  });
}

const logout = async(req,res)=>{
  res.cookie('token','logout',{
    httpOnly:true,
    expires:new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({msg:'User logged out'});
}

const register = async(req,res)=>{
  const {name,email,password} = req.body;
  const userExists = await User.findOne({email});
  if(userExists){
    throw new BadRequestError('A user already exists with this username.');
  }
  const user = await User.create({name,email,password});
  const payload = createTokenUser(user);
  attachCookiesToResponse({res,payload});
  res.status(StatusCodes.CREATED).json({
    user:payload
  });
}

module.exports = {
  login,
  logout,
  register
}