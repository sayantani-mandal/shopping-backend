const express = require('express');
const { Comment,validate } = require('../models/comment');
const { Product } = require('../models/product');
const  { User }  = require('../models/user');
const router = express.Router();

router.post('/', async (req,res)=>{
try{
 
let comment = new Comment({ ...req.body});

const {error} = validate(req.body);
if (error) return res.status(400).send({Error:error.details[0].message});

let user = await User.findById(comment.userId);
if(!user) return res.status(400).send({Error:'user Id is not a valid user Id'});

let pro = await Product.findById(comment.proId);
if(!pro) return res.status(400).send({Error:'Product Id is not a valid Product Id'});

comment = await comment.save();
res.send({Comment:`${comment.comment}`});

} 
  catch(e){
    res.status(402).send(e);
}  
});



module.exports =  router;


