const express = require('express');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const passwordComplexity = require('joi-password-complexity');


const adminSchema = new mongoose.Schema({
    email:{
        type: String,
        required : true
    },
    password:{
        type: String,
        required : true
    }, 
    tokens: [{
        token:{ 
            type: String,
            required: true
        }          
        
    }],
    createdAt:{
        type:Date,
        default:Date.now()
    }
 });

 adminSchema.methods.generateAuthToken = async function(){
    const admin = this;
	const token = jwt.sign({_id: this._id, email: this.email },"vidly_jwtPrivateKey");
    admin.tokens = admin.tokens.concat({token});
    await admin.save();
    return token;
}
 
 const Admin = mongoose.model('Admin',adminSchema);

 function validateAdmin(admin){
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        createdAt: Joi.date()
    });

    return schema.validate(admin);
}

function validatePassword(admin) {
    const complexityOptions = {
      min: 6,
      max: 30,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
    };
  
    return passwordComplexity(complexityOptions).validate(admin.password);
  }
 
 
exports.Admin = Admin;
exports.validate = validateAdmin;
exports.validatePassword = validatePassword ;