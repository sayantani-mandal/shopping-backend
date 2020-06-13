const express = require('express');
const bcrypt = require('bcrypt');
const { User, validate , validatePassword , validateMobile } = require('../models/user');
const _ = require('lodash');
const router = express.Router();

router.post('/' , async (req,res) => {
try{

    const {error} = validate(req.body);
    if (error) return res.status(400).send({Error:error.details[0].message}); 

    const result = validatePassword(req.body);
    if (result.error) return res.status(400).send({Error:'password must contaion one uppercas,one lowercase,one numeric and one symbol'});

    const resultMob = validateMobile(req.body.mobileNumber);
    console.log(resultMob);
    if (!resultMob) return res.status(400).send({Error:'Mobile number must be INDIAN MObile Number'});

    let user = await User.findOne({email:req.body.email});
    if(user) return res.status(400).send({Error:'user is already registered'});

    user = new User({...req.body});
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();
    // res.send(_.pick(user, ['firstName', 'email']));
    res.send({Succes:`Hello ${user.firstName} , you are registered successfully`});
	
}
catch(e){
	res.status(402).send(e);
}
	
});

module.exports = router;