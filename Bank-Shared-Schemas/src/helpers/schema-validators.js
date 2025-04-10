

function validateNoPastTime(firstPaymentDate, helpers){

    const today = new Date();
    today.setHours(0,0,0,0);
    if (firstPaymentDate < today){
        return helpers.error('date.noPastDates');
    }
    return firstPaymentDate;
}


module.exports={
    validateNoPastTime
}