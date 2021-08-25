const inquirer = require('inquirer');
const mysql = require('mysql2')
const consoleTable = require('console.table')
const db = require("/.db");

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: "That'sNoMoon1!",
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
);

async function startMenu {
    const userSelection = await inquirer.prompt({
        type: "list",
        name: "selection",
        message: "What would you like to do? Select option from list.",
        choices:    ["View Department",
                    "Add Department",
                    "View Role",
                    "Add Role",
                    "View Employee",
                    "Add Employee",
                    "Update Employee"]
    });

    if (userSelection.selection === "View Department")
        return viewDepartment();
    if (userSelection.selection === "Add Department")
        return addDepartment();
    if (userSelection.selection === "View Role")
        return viewRole();
    if (userSelection.selection === "Add Role")
        return addRole();
    if (userSelection.selection === "View Employee")
        return viewEmployee();
    if (userSelection.selection === "Add Employee")
        return addEmployee();
    if (userSelection.selection === "IUpdate Employee")
        return updateEmployee();
}








