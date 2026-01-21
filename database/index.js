// const { Pool } = require("pg")
// require("dotenv").config()
/* **
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * **/
// let pool 
// if (process.env.NODE_ENV == "development") {
//     pool = new Pool ({
//         connectionString: process.env.DATABASE_URL,
//         ssl: {
//             rejectUnauthorized: false,
//         },
//     })

// Added for troubleshooting queries
// during development
// module.exports = {
//     async query(text, params) {
//         try {
//             const res = await pool.query(text, params)
//             console.log("executed query", { text })
//             return res
//         } catch (error) {
//             console.error("error in query", { text })
//             throw error
//         }
//     },
// }
// } else {
//     pool = new Pool({
//         connectionString: process.env.DATABASE_URL,
//     })
//     module.exports = pool
// }

const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

module.exports = {
  async query(text, params) {
    try {
      const result = await pool.query(text, params)
      if (process.env.NODE_ENV === "development") {
        console.log("Executed query:", text)
      }
      return result
    } catch (e) {
      console.error("Database query error:", e.message)
      throw e
    }
  }
}