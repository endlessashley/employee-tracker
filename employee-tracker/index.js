const inquirer = require('inquirer');
const mysql = require('mysql2')
const consoleTable = require('console.table');
const { restoreDefaultPrompts } = require('inquirer');

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: "That'sNoMoon1!",
        database: 'employees_db'
    });

db.connect(err => {
    if (err) throw err;
    prompt();
})



//load prompts

const prompt = () => {
    return inquirer.prompt([
        {
            type: "list",
            name: "selection",
            message: "What would you like to do? Select from the list below.",
            choices: ["View Departments",
                "Add Department",
                "View Roles",
                "Add Role",
                "View Employees",
                "Add Employee",
                "Update Employee"]
        }
    ]).then((answers) => {
        if (answers.selection === "View Departments") {
            viewDepartments();
        } else if (answers.selection === "Add Department") {
            addDepartment();
        } else if (answers.selection === "View Roles") {
            viewRoles();
        } else if (answers.selection === "Add Role") {
            addRoleInfo();
        } else if (answers.selection === "View Employees") {
            viewEmployees();
        } else if (answers.selection === "Add Employee") {
            addEmployeeInfo();
        } else if (answers.selection === "Update Employee") {
            updateEmployeeInfo();
        }

    })
}

//functions for handling user selections

const viewDepartments = () => {
    db.query('SELECT * FROM department_name', (err, res) => {
        console.table(res);
        prompt();
    })
}

const viewRoles = () => {
    db.query('SELECT * FROM roles', (err, res) => {
        console.table(res);
        prompt();
    })
}

const viewEmployees = () => {
    db.query('SELECT * FROM employee', (err, res) => {
        console.table(res);
        prompt();
    })
}

const addDepartment = () => {
    return inquirer.prompt([
        {
            type: "input",
            name: "deptName",
            message: "Enter a department name"
        }
    ])
        .then((answers) => {
            const newDepartment = `INSERT INTO department (department_name) VALUES ("${answers.deptName}");`;
            db.query(newDepartment)
            console.log('Department added');
            prompt();
        })
};

const addRoleInfo = () => {
    const deptArray = [];

    db.query("SELECT department_name FROM department", function (err, results, field) {
        results.forEach(element => {
            deptArray.push(element.department_name)
        })
    })

    return inquirer.prompt([
        {
            type: "input",
            name: "role_name",
            message: "What is the name of the new role?",
        },

        {
            type: "input",
            name: "salary",
            message: "What is the new role's salary?",
        },

        {
            type: "list",
            name: "department_selection",
            message: "In what department is the new role?",
            choices: deptArray,
        }
    ]).then((answers) => {
        let deptIndex = 0
        console.log(answers.department_selection)
        console.log(answers)
        db.query(`SELECT id FROM department where department_name = '${answers.department_selection}'`, function (err, results) {

            deptIndex = parseInt(results[0].id);
            addRole()
        });



        const addRole = () => {
            console.log(answers.role_name)
            db.query(`INSERT INTO roles (title, salary, department_id) VALUES(?,?,?)`, [answers.role_name, parseInt(answers.salary), deptIndex], (err, results) => {
                console.log(deptIndex)
                console.log(parseInt(deptIndex))
                prompt();
            });
        }
    }).catch((err) => console.error(err))

}

const addEmployeeInfo = () => {
    const roleArray = [];
    const managerArray = [];

    db.query("SELECT title FROM roles", function (err, results, field) {
        results.forEach(element => {
            roleArray.push(element.title)
        });
    })

    db.query("SELECT id FROM employee WHERE manager_id IS NULL", function (err, results, field) {
        results.forEach(element => {
            managerArray.push(element.id)
        });
        managerArray.push("None")
    })

    return inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "Enter employee's first name",
        },
        {
            type: "input",
            name: "last_name",
            message: "Enter employee's last name",
        },
        {
            type: "list",
            name: "role_selection",
            message: "Select employee role",
            choices: roleArray,
        },
        {
            type: "list",
            name: "manager_selection",
            message: "Select employee's manager by id",
            choices: managerArray,
        }
    ]).then((answers) => {

        let roleID;
        let managerID = answers.manager_selection;

        if (answers.manager_selection === "None") {
            managerID = null;
        }

        db.query(`SELECT id FROM roles where title = '${answers.role_selection}'`, function (err, results) {
            roleID = parseInt(results[0].id);
            addEmployee()
        });

        const addEmployee = () => {
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?,?,?,?)`, [answers.first_name, answers.last_name, roleID, managerID], (err, results) => {
                console.log(roleID)
                prompt();
            });
        }
    }).catch((err) => console.error(err))

}

const updateEmployeeInfo = () => {
    const employeeArray = [];
    const managerArray = [];
    const roleArray = [];

    db.query(`SELECT DISTINCT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`, function (err, results, field) {
        results.forEach(element => {
            employeeArray.push(element.name)
        })
    })

    db.query("SELECT id FROM employee WHERE manager_id IS NULL", function (err, results, field) {
        results.forEach(element => {
            managerArray.push(element.id)
        });
        managerArray.push("None")
    })

    db.query("SELECT title FROM roles", function (err, results, field) {
        results.forEach(element => {
            roleArray.push(element.title)
        });
    })

    return inquirer.prompt([
        {
            type: "list",
            name: "employee_update",
            message: "Which employee would you like to update?",
            choices: employeeArray
        }, 

        {
            type: "list",
            name: "role_update",
            message: "What is the employee's new role?",
            choices: roleArray
        }, 

        {
            type: "list",
            name: "manager_update",
            message: "Who is the employee's new manager?",
            choices: managerArray
        },

        {
            type: "input",
            name: "salary_update",
            message: "What is the employee's new salary?",
        }
    ]).then((answers) => {
        let roleID;
        let managerID = answers.manager_update;

        if(answers.manager_update === "None") {
            managerID = null;
        }

        db.query(`SELECT id FROM roles where title = '${answers.role_update}'`, function (err, results) {
            roleID = parseInt(results[0].id);
            updateEmployee()
        });

        const updateEmployee = () => {
            db.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${emp_id}`, (err, results) => {
                prompt();
            });
        }
    }).catch((err) => console.error(err))
        }