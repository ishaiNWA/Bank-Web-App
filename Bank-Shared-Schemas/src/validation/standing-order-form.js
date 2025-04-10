const Joi = require("joi");
const {validateNoPastTime} = require("../helpers/schema-validators")

const standingOrderFormSchema = Joi.object({
 requestID : Joi.string().required(),
 senderEmail : Joi.string().email().required(),
 recipientEmail : Joi.string().email().required(),
 taskType : Joi.string().valid('TRANSACTION').required(),
 firstPaymentDate : Joi.date().iso().custom(validateNoPastTime).required(),
 paymentFrequency: Joi.alternatives().try(
    Joi.number().integer().min(1),
    Joi.string().valid('CONTINUOUS')
 ).required(),
 totalPayments: Joi.number().integer().min(1).required(),
 amount: Joi.number().positive().precision(2).required()
})

/**
 * @param {Object} data - The data to validate
 * @returns {Object} Object with value and error properties
 */
function validateStandingOrderFormSchema(data){
   return standingOrderFormSchema.validate(data);
}

module.exports = {
    validateStandingOrderFormSchema,
    standingOrderFormSchema
}