const express = require('express');
const Subcat = require('../models/subcat');
const router = express.Router();

router.post('/', async (req,res)=>{
try{

    let subcat = new Subcat({ ...req.body});
     subcat = await subcat.save();
     
     res.send(subcat);

} 
  catch(e){
    res.status(402).send(e);
}  
});



module.exports =  router;