const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* **
 * Build inventory by classification view
 * **/
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/* **
 * Build inventory detail view
 * **/
invCont.buildDetailView = async function (req, res, next) {
    const inv_id = req.params.invid
    const vehicle = await invModel.getInventoryDetails(inv_id)
    const details = await utilities.buildInventoryDetails([vehicle])
    let nav = await utilities.getNav()
    const year = vehicle.inv_year
    const make = vehicle.inv_make
    const model = vehicle.inv_model
    res.render("./inventory/detail", {
        title: year + ' ' + make + ' ' + model,
        nav,
        details,
    })
}

/* **
 * Build an inventory management view
 * **/
invCont.buildManagementView = async function (req, res, next) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        list: classificationSelect,
    })
}

/* **
 * Build an add new classification view
 * **/
invCont.buildAddClassificationView = async function (req, res, next) {
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    })
}

/* **
 *Add classification process
 * **/
invCont.addClassification = async function (req, res) {
    let nav = await utilities.getNav()
    const { classification_name } = req.body

    const newClassResult = await invModel.addClassification(classification_name)

    if (newClassResult) {
        req.flash(
            "notice-success",
            `The ${classification_name} classification was successfully added.`
        )

        const nav = await utilities.getNav()
        const list = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            list,
        })
    } else {
        req.flash("validation-notice", "Sorry, failed to add new classification.")
        res.status(501).render("./inventory/add-classification", {
            title: "Add New classification",
            nav,
        })
    }
}

/* **
 * Build an add new inventory view
 * **/
invCont.buildAddInventoryView = async function (req, res, next) {
    const list = await utilities.buildClassificationList()
    const nav = await utilities.getNav()
    res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav: null,
        list,
        errors: null,
    })
}

/* **
 * Add new vehicle process
 * **/
invCont.addNewVehicle = async function (req, res) {
    let nav = await utilities.getNav()
    const { 
        inv_make,  
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    } = req.body

    const newVehicleResult = await invModel.addNewVehicle(
        inv_make,  
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )

    if (newVehicleResult) {
        req.flash(
            "notice-success",
            `The ${inv_make} ${inv_model} was successfully added.`
        )

        const nav = await utilities.getNav()
        const list = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            list,
        })
    } else {
        req.flash("validation-notice", "Sorry, failed to add new vehicle.")
        res.status(501).render("./inventory/add-inventory", {
            title: " ",
            nav: null,
            list,
        })
    }
}

/* **
 * Return Inventory by Classification As JSON
 * **/
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* **
 * Build an add edit vehicle information view
 * **/
invCont.buildEditVehicleInformation = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const inventoryData = await invModel.getInventoryDetails(inv_id)
    const list = await utilities.buildClassificationList(inventoryData.classification_id)
    const itemName = `${inventoryData.inv_make} ${inventoryData.inv_model}`
    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        list: list,
        errors: null,
        inv_id: inventoryData.inv_id,
        inv_make: inventoryData.inv_make,
        inv_model: inventoryData.inv_model,
        inv_year: inventoryData.inv_year,
        inv_description: inventoryData.inv_description,
        inv_image: inventoryData.inv_image,
        inv_thumbnail: inventoryData.inv_thumbnail,
        inv_price: inventoryData.inv_price,
        inv_miles: inventoryData.inv_miles,
        inv_color: inventoryData.inv_color,
        classificationId: inventoryData.classification_id
    })
}

/* **
 * Edit vehicle information process
 * **/
invCont.updateInventory = async function (req, res) {
    let nav = await utilities.getNav()
    const { 
        inv_id,
        inv_make,  
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body

    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,  
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash(
            "notice-success",
            `The ${itemName} was successfully updated.`
        )
        res.redirect("/inv/")
    } else {
        const list = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("validation-notice", "Sorry, the insert failed.")
        res.status(501).render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            list: list,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}

/* **
 * Build a delete vehicle confirmation view
 * **/
invCont.buildDeleteView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const inventoryData = await invModel.getInventoryDetails(inv_id)
    const itemName = `${inventoryData.inv_make} ${inventoryData.inv_model}`
    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: inventoryData.inv_id,
        inv_make: inventoryData.inv_make,
        inv_model: inventoryData.inv_model,
        inv_year: inventoryData.inv_year,
        inv_price: inventoryData.inv_price,
    })
}

/* **
 * Delete vehicle information process
 * **/
invCont.deleteInventory = async function (req, res) {
    const inv_id = parseInt(req.body.inv_id)

    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    if (deleteResult) {
        req.flash(
            "notice-success",
            `The deletion was successful.`
        )
        res.redirect("/inv/")
    } else {
        req.flash("validation-notice", "Sorry, the delete failed.")
        res.redirect("/inv/delete/inv_id") 
    }
}

/* **
 * Trigger an intentional 500 error 
 * **/
invCont.intentionalError = async function (req, res, next) {
    try {
        throw new Error("This is an intentional error for testing purposes.")
    } catch (err) {
        next(err)
    }
};
  

module.exports = invCont