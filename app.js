/* ******************************************
 * Primary Server File
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const pgSession = require("connect-pg-simple")(session);
const messages = require("express-messages");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/* ***********************
 * App Initialization (MUST BE FIRST)
 *************************/
const app = express();

/* ***********************
 * Local Modules
 *************************/
const indexRoutes = require("./routes/index");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const errorRoute = require("./routes/errorRoute");
const utilities = require("./utilities/");
const pool = require("./database/");

/* ***********************
 * Middleware
 *************************/

// Session Middleware
app.use(
  session({
    store: new pgSession({
      createTableIfMissing: true,
      pool: pool,
    }),
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);

// Flash Middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = messages(req, res);
  next();
});

// Parsers
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT Token Validation
app.use(utilities.checkJWTToken);

// Navigation middleware
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    next(err);
  }
});

// Static Files
app.use(express.static("public"));

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use("/", indexRoutes);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/account", accountRoute);
app.use("/inv", inventoryRoute);
app.use("/error", errorRoute);

// Test Route
app.get("/account/test", (req, res) => {
  res.send("Account test route is working");
});

// Flash Test
app.get("/test-flash", (req, res) => {
  req.flash("success", "Flash message is working!");
  res.redirect("/account/login");
});

// 404 Handler
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Error Handler
 *************************/
app.use((err, req, res, next) => {
  console.error(`Error at "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message: err.message || "An unknown error occurred.",
    nav: res.locals.nav,
  });
});

/* ***********************
 * Server Configuration
 *************************/
const port = process.env.PORT || 10000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
