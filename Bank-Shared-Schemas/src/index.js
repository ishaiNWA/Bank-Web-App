const standingOrderFormValidation = require("./validation/standing-order-form");
const adminPostTransactionReqBodyValidation = require("./validation/admin-post-transaction-request-body");

module.exports={
    validateStandingOrderFormSchema : standingOrderFormValidation.validateStandingOrderFormSchema,
    standingOrderFormSchema: standingOrderFormValidation.standingOrderFormSchema,
    validateAdminPostTransactionSchema : adminPostTransactionReqBodyValidation.validateAdminPostTransactionSchema
}