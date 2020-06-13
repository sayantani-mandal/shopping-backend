const express = require("express");
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const { Category } = require("../models/category");
const Brand = require("../models/brand");

const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  proName: {
    type: String,
    minlength: 3,
    required: true,
    //unique:true
  },
  proDes: {
    type: String,
    required: true,
  },
  proSpec: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  proImages: [
    {
      proImage: {
        type: String,
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

productSchema.virtual("categories", {
  ref: "Category",
  localField: "categoryId",
  foreignField: "_id",
});

const Product = mongoose.model("Product", productSchema);
function validateProduct(pro) {
  const schema = Joi.object({
    categoryId: Joi.string().required(),
    brandId: Joi.string().required(),
    proName: Joi.string().min(3).required(),
    proDes: Joi.string().required(),
    proSpec: Joi.string().required(),
    price: Joi.number().required(),
    isActive: Joi.boolean(),
    createdAt: Joi.date(),
  });

  return schema.validate(pro);
}
exports.Product = Product;
exports.validate = validateProduct;
