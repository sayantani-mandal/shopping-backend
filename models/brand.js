const express = require('express');
const mongoose = require('mongoose');



const brandSchema = new mongoose.Schema({
    brandName : String,
    brandImage : String,
    createdAt:{
        type:Date,
        default:Date.now()
    }
 });
 
 const Brand = mongoose.model('Brand',brandSchema);
 
 module.exports = Brand;