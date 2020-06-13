const express = require('express');
const bcrypt = require('bcrypt');
const { Admin , validate , validatePassword } = require('../models/admin');
//const _ = require('lodash');
const router = express.Router();

router.post('/' , async (req,res) => {
try{

    const {error} = validate(req.body);
    if (error) return res.status(400).send({Error:error.details[0].message}); 

    const result = validatePassword(req.body);
    if (result.error) return res.status(400).send({Error:'password must contaion one uppercas,one lowercase,one numeric and one symbol'});

    let admin = await Admin.findOne({email:req.body.email});
    if(admin) return res.status(400).send({Error:'Admin is already registered'});

    admin = new Admin({...req.body});
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    admin = await admin.save();
  
    res.send({Success:'Admin is registered successfully'});
	
}
catch(e){
	res.status(402).send(e);
}
	
});

module.exports = router;