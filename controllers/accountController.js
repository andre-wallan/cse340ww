const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Build the login view
async function buildLoginView(req, res, next) {
    const nav = await utilities.getNav()
    res.render("account/login", { 
        title: "Login", 
        nav,
        errors: null,
    })
}

// Build the registration view
async function buildRegisterView(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

// Build the account management view
async function buildAccountManagementView(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}


async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("validation-notice", "Sorry, there was an error processing the registration.")
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice-success",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
}

/* **
 * Process login request
 * **/
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const {account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("validation-notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      req.session.loggedin = true
      req.session.account = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_nickname: accountData.account_nickname,
        account_email: accountData.account_email
      }

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })        
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("validation-notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
  console.error("Login error:", error)
  req.flash("validation-notice", "Login failed. Please try again.")
  return res.status(500).render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

  }


// build log out process


function logout(req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error("Session destruction error:", err)
      return res.status(500).send("Logout failed")
    }

    res.clearCookie("jwt") // ✅ Clear JWT cookie
    res.redirect("/")       // ✅ Redirect to home or login
  })
}

// build account update view
async function buildAccountUpdateView(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountDetails(account_id)
  res.render("account/update", {
    title: "Edit Account",
    nav,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    errors: null,
  })

}

// update account process
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if(updateResult) {
    const updatedAccount = await accountModel.getAccountDetails(account_id)

    const token = jwt.sign(
      updatedAccount,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 * 1000 }
    )

    res.cookie("jwt", token, {httpOnly: true, maxAge: 3600 * 1000 })

    req.flash(
      "notice-success",
      "Congratulations, your information has been updated"
    )
    res.redirect("/account/")
  } else {
    req.flash("validation-notice", "Sorry the update failed")
    res.status(501).render("account/update", {
      title: "Edit Account",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      errors: null,
    })
  }
}

// change password process
async function changePassword(req, res) {
  const { account_id, account_password } = req.body

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(account_password, 10)

    //Update password in DB
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

    //Check update success
    if (updateResult) {
      req.flash("notice-success", "Password updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("validation-notice", "Password update failed. Please try again.")
      return res.redirect(`/account/update/${account_id}`)
    }

  } catch (error) {
    console.error("Password update error:", error)
  }
}

// build nickname view
async function buildNicknameView(req, res) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountDetails(account_id)
  const viewTitle = accountData.account_nickname ? "Edit Nickname" : "Add Nickname"

  res.render("account/nickname", {
    title: viewTitle,
    nav,
    account_id: accountData.account_id,
    account_nickname: accountData.account_nickname,
    errors: null,
  })
} 

//change nickname process
async function changeNickname(req, res) {
  const { account_id, account_nickname } = req.body
  let nav = await utilities.getNav()

  try {
    const updateResult = await accountModel.updateNickname(account_id, account_nickname)
    if (updateResult) {
      req.flash("notice-success", "Nickname updated successfully.")
      // Update session so header shows new nickname immediately
      const updatedAccount = await accountModel.getAccountDetails(account_id)
      req.session.account = updatedAccount
      res.redirect("/account/")
    } else {
      req.flash("validation-notice", "Nickname update failed.")
      res.status(501).render("account/nickname", {
        title: "Edit Nickname",
        nav,
        errors: null,
      })
    }
  } catch (error) {
    console.error("Nickname change error:", error)
  }
}

module.exports = { 
  buildLoginView, 
  buildRegisterView, 
  registerAccount, 
  accountLogin, 
  buildAccountManagementView, 
  buildAccountUpdateView, 
  updateAccount,
  changePassword,
  buildNicknameView,
  changeNickname,
  logout 
}