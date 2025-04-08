var express = require("express");
var router = express.Router();
const jwt = require("../middlewares/jwt");
const scheduleTaskController = require("../controllers/schedule-task-controller");


router.post("/standing-order",
    jwt.protect,
    scheduleTaskController.validateStandingOrderFormSchema,
    scheduleTaskController.submitTaskToScheduleFinService,
    scheduleTaskController.confirmTaskSchedulingByEmail,
)

module.exports = router;

/* 
    scheduleTaskController.validateStandingOrderFormSchema,
    scheduleTaskController.submitTaskToScheduleFinService,
    scheduleTaskController.confirmTaskSchedulingByEmail

*/