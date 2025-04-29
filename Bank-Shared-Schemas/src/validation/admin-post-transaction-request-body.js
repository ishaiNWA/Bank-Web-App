const Joi = require("joi");

const adminPostTransactionSchema = Joi.object({
    
        recipientEmail: Joi.string().email().required(),
        senderEmail: Joi.string().email().required(),
        amount: Joi.integer().min(1).required(),
});


function validateAdminPostTransactionSchema(data){
   return adminPostTransactionSchema.validate(data);
};

module.exports = {
    validateAdminPostTransactionSchema
};