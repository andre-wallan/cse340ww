const pool = require("../database/")

// inventory-controller.js
const utilities = require("../utilities");
const invModel = require("../models/inventory-model");

async function showInventoryPage(req, res) {
    const classifications = await invModel.getClassifications();
    const nav = utilities.getNav(classifications.rows); // pass data in
    res.render("inventory/list", { nav, classifications: classifications.rows });
}

/* **
* Register new account
** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **
 * Check for existing email
 * **/
async function checkExistingEmail(account_email){
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"  
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* **
 * Return account data using email address
 * **/
async function getAccountByEmail (account_email) {
   try {
    const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
        [account_email])
        return result.rows[0]
   } catch (error) {
    return new Error("No matching email found")
   }
}

// get details by account_id
async function getAccountDetails(account_id) {
    try {
        const info = await pool.query (
            `SELECT * FROM public.account
            WHERE account_id = $1`,
            [account_id]
        )
        return info.rows[0]
    } catch (error) {
        console.error("getAccountDetails error " + error)
    }
}

// update account results in database
async function updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
) {
    try {
        const sql = "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
        const data = await pool.query(sql, [
            account_firstname,
            account_lastname,
            account_email,
            account_id
        ])
        return data.rows[0]
    } catch (error) {
        console.log("Update Account error: " + error)
    }
}

// update password results
async function updatePassword(account_id, hashedPassword) {
    try {
        const sql = "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *"
        const result = await pool.query(sql, [hashedPassword, account_id])
        return result.rows[0]
    } catch (error) {
        console.log("Update password error:" + error)
    }
}

// update nickname
async function updateNickname(account_id, account_nickname) {
    try {
        const sql = "UPDATE public.account SET account_nickname = $1 WHERE account_id = $2 RETURNING *"
        const data = await pool.query(sql, [account_nickname, account_id])
        return data.rows[0]
    } catch (error) {
        console.error("Update nickname error:", error)
    }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountDetails, updateAccount, updatePassword, updateNickname }