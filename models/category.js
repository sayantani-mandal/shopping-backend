const express = require("express");
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const Brand = require("../models/brand");

const categorySchema = new mongoose.Schema({
  catName: {
    type: String,
  },
  brandIds: [
    {
      brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    },
  ],
  catDes: String,
  catImage: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

categorySchema.set("toObject", { virtuals: true });
categorySchema.set("toJSON", { virtuals: true });

categorySchema.virtual("brands", {
  ref: "Brand",
  localField: "brandIds.brandId",
  foreignField: "_id",
});

const Category = mongoose.model("Category", categorySchema);

function validateCategory(cat) {
  const schema = Joi.object({
    brandIds: Joi.array().required(),
    catName: Joi.string().min(3).required(),
    catDes: Joi.string(),
    //catImage:Joi.string(),
    isActive: Joi.boolean(),
    createdAt: Joi.date(),
  });

  return schema.validate(cat);
}

exports.Category = Category;
exports.validate = validateCategory;
