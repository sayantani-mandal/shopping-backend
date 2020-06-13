const express = require('express');
const mongoose =require('mongoose');
const Category = require('../models/category');


const subcategorySchema = new mongoose.Schema({
    subcatName:String,
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    isActive:{
        type: Boolean,
        default: true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
 });
 
 const Subcat = mongoose.model('Subcategory',subcategorySchema);
 
 module.exports = Subcat;