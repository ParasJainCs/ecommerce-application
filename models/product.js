const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const ProductSchema = new mongoose.Schema({
  name:{
    type:String,
    trim:true,
    maxlength:[100,"A product's name can't be more than 100 characters."],
    required:[true,"Please provide a product's name."],
  },
  price:{
    type:Number,
    required:[true,"Please provide a product's price."],
    default:0
  },
  description:{
    type:String,
    required:[true,"Please provide a product's description."],
    maxlength:[1000,"A product's description can't be more than 1000 characters."],
  },
  image:{
    type:String,
    default:'/uploads/example.jpeg'
  },
  category:{
    type:String,
    enum:['office','kitchen','bedroom'],
    required:[true,"Please provide a product's category."],
  },
  company:{
    type:String,
    enum:{
      values:['ikea','liddy','marcos'],
      message:'{VALUE} is not supported',
    },
    required:[true,"Please provide a product's company."],
  },
  colors:{
    type:[String],
    required:[true,"Please provide a product's colors."],
  },
  freeShipping:{
    type:Boolean,
    default:false
  },
  featured:{
    type:Boolean,
    default:false
  },
  inventory:{
    type:Number,
    required:true,
    default:15
  },
  numOfReviews:{
    type:Number,
    default:0
  },
  averageRating:{
    type:Number,
    default:0
  },
  user:{
    type:mongoose.Types.ObjectId,
    ref:'User',
    required:true
  }
},
{
  timestamps:true,
  // Alternative syntax to get reviews attached to a product.
  // toJSON:{virtuals:true},
  // toObject:{virtuals:true}
});

// Alternative syntax to get reviews attached to a product.
// ProductSchema.virtual('reviews',{
//   ref:'Review',
//   localField:'_id',
//   foreignField:'product',
//   justOne:false,
// });

ProductSchema.pre('remove',async function(){
  await this.model('Review').deleteMany({product:this._id});
});

module.exports = mongoose.model('Product', ProductSchema);