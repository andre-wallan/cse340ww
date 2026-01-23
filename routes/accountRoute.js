// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")

// Route to build the login view
router.get("/login", utilities.handleErrors(accountController.buildLoginView));

// Route to build the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegisterView));

// Process the registration data
router.post(
    "/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

//route to build account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagementView));

// route to access log out process
router.get("/logout", utilities.handleErrors(accountController.logout));

//route to build account update view
router.get("/update/:account_id", utilities.handleErrors(accountController.buildAccountUpdateView));

// Process for account update
router.post(
  "/update-account",
  regValidate.updateAccountRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process for password change
router.post(
  "/update-password",
  regValidate.changePasswordRules(),
  regValidate.checkPassword,
  utilities.handleErrors(accountController.changePassword)
);

// route to build nickname view
router.get("/nickname/:account_id", utilities.handleErrors(accountController.buildNicknameView));

// add/edit nickname process
router.post(
  "/edit-nickname",
  regValidate.nicknameRules(),
  regValidate.checkNickname,
  utilities.handleErrors(accountController.changeNickname)
) 

module.exports = router