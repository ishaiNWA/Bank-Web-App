const validation = require("./validation/standing-order-form");


module.exports={
    validateStandingOrderFormSchema : validation.validateStandingOrderFormSchema,
    standingOrderFormSchema: validation.standingOrderFormSchema
}