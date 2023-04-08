const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:{
    type:String,
    minlength: 3,
    maxlength:50,
    required:[true,'You must provide a username.'],
  },
  email:{
    type:String,
    unique:true,
    maxlength:50,
    required:[true,'You must provide a user email.'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    }
  },
  password:{
    type:String,
    minlength: 6,
    required:[true,'You must provide a user password.'],
  },
  role:{
    type:String,
    enum:['admin','user'],
    default:'user'
  }
});

UserSchema.pre('save',async function(){
  if (!this.isModified('password')) return;
  // In case, user changed the password through security and stuff, I should handle it here. Perhaps. I think it does not need handling.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function(candidatePassword){
  const isMatch = await bcrypt.compare(candidatePassword,this.password);
  return isMatch;
}

module.exports = mongoose.model('User', UserSchema);