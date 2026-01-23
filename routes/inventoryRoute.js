// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to handle intentional 500 error
router.get("/error", invController.intentionalError);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view
router.get("/detail/:invid", invController.buildDetailView);

// Route to build inventory management view
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagementView));

// Route to build an add new classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassificationView));

// Route to build an add inventory view
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventoryView));

//Process the classification addition
router.post(
    "/add-classification", 
    invValidate.addClassificationRules(),
    invValidate.checkAddData,
    utilities.checkAccountType,
    utilities.handleErrors(invController.addClassification));

//Process the vehicle addition    
router.post(
    "/add-inventory",
    invValidate.addInventoryRules(),
    invValidate.checkNewVehicleData,
    utilities.checkAccountType,
    utilities.handleErrors(invController.addNewVehicle));

router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))

// Route to build the edit vehicle information view
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildEditVehicleInformation))

//Process the information editing
router.post(
    "/update/",
    invValidate.addInventoryRules(),
    invValidate.checkEditVehicleData,
    utilities.checkAccountType,
    utilities.handleErrors(invController.updateInventory)
)

// Route to build the delete confirmation view
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteView))

// Process the deleting
router.post(
    "/delete/",
    utilities.checkAccountType,
    utilities.handleErrors(invController.deleteInventory)
)

module.exports = router