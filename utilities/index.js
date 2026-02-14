const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

function getNav(classifications) {
    let nav = "<ul>";
    classifications.forEach(c => {
        nav += `<li>${c.classification_name}</li>`;
    });
    nav += "</ul>";
    return nav;
}

/* **
 * Constructs the nav HTML unordered list
 * **/
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    console.log(data)
    let list = "<ul id='dynamic-nav'>"
    list += '<li><a href="/" title="Home page">Home</a></li>' 
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            '</a>'
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **
* Build the classification view HTML
* ** */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + ' details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors"></a>'
        grid += '<div class="namePrice">'
        grid += '<hr>'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }

  Util.buildInventoryDetails = async function(info) {
    let details
    if(info.length > 0) {
      details = '<div id="inv-details">'
      info.forEach(vehicle => {
        details += '<div>'
        details += '<img src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '">'
        details += '</div>'
        details += '<div class="inv-details-text">'
        details += '<h3><strong>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details</strong></h3>'
        details += '<p><strong>Price:</strong> $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>'
        details += '<p><strong>Description:</strong> ' + vehicle.inv_description + '</p>'
        details += '<p><strong>Color:</strong> ' + vehicle.inv_color + '</p>'
        details += '<p><strong>Mileage:</strong> ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + ' miles</p>'
        details += '</div>'
      })
      details += '</div>'
    } else {
      details += '<p class="notice">Sorry, no details found for this vehicle.</p>'
    }
    return details
  }

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}  

/* **
 * Middleware to check token validity
 * **/
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const accountData = jwt.verify(
        req.cookies.jwt,
        process.env.ACCESS_TOKEN_SECRET
      )
      res.locals.accountData = accountData
      res.locals.loggedin = true
      next()
    } catch (err) {
      req.flash("validation-notice", "Please log in")
      res.clearCookie("jwt")
      res.locals.loggedin = false
      next()
    }
  } else {
    res.locals.loggedin = false
    next()
  }
}

/* **
 * Check Login
 * **/
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("validation-notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* **
 * Check Account type
 * **/
Util.checkAccountType = (req, res, next) => {
  const accountData = res.locals.accountData
  // if no user data, login is required to access this view
  if (!accountData) {
    req.flash("validation-notice", "Please Log in to continue.")
    return res.redirect("/account/login")
  }
  
  // check the account type
  if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
    return next()
  } else{
    req.flash("validation-notice", "You do not have the permission to access this page.")
    return res.redirect("/account/login")
  }
}

/* **
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 * **/
Util.handleErrors  = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
  
module.exports = Util