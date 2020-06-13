const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const passwordComplexity = require('joi-password-complexity');


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String
    
    },
    password: {
        type: String,
        required: true
    },
    addresses:  [{
          address: {
              type:String
        } 
        }],
    otp: String,
    expiredTime: {
        type : Date
    },
  
    tokens: [{
        token:{ 
            type: String,
            required: true
        }          
        
    }]

});

userSchema.methods.generateAuthToken = async function(){
    const user = this;
	const token = jwt.sign({_id: this._id, email: this.email },"vidly_jwtPrivateKey");
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

const User = mongoose.model('User',userSchema);

function validateUser(user){
    const schema = Joi.object({
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        mobileNumber:Joi.string(),
        addresses:Joi.array().max(5),
        myImage : Joi.string()
    });

    return schema.validate(user);
}

function validatePassword(user) {
    const complexityOptions = {
      min: 6,
      max: 30,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
    };
  
    return passwordComplexity(complexityOptions).validate(user.password);
  }

  function validateMobile(number){
     var IndNum = /^[6-9]\d{9}$/;
      var flag = false;
      if(IndNum.test(number)){
          flag = true;
      }else{
          flag = false;
      }
      return flag;
  }

exports.User = User ;
exports.validate = validateUser ;
exports.validatePassword = validatePassword ;
exports.validateMobile = validateMobile ;