const express = require('express');
const mongoose = require('mongoose');
const  { Product } = require('../models/product');
const  { User }  = require('../models/user');
const Joi = require('@hapi/joi');


const commentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    proId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    comment : String,
    createdAt:{
        type:Date,
        default:Date.now()
    }
 });
 
 const Comment = mongoose.model('Comment',commentSchema);

 function validateComment(comment){
    const schema = Joi.object({
        userId: Joi.string().required().pattern(new RegExp('^[0-9a-fA-f]{24}$')),
        proId: Joi.string().required().pattern(new RegExp('^[0-9a-fA-f]{24}$')),
        comment: Joi.string().required(),
        createdAt: Joi.date()
    });

    return schema.validate(comment);
}
 
 
exports.Comment = Comment;
exports.validate = validateComment;