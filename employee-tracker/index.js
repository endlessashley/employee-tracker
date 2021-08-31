const inquirer = require('inquirer');
const mysql = require('mysql2')
const consoleTable = require('console.table');
const util = require('util')

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

db.query = util.promisify(db.query)

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
const viewDepartments = async () => {
    db.query('SELECT department_name FROM department', (err, res) => {
        console.table(res);
        prompt();
    })
};


const viewRoles = async () => {
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

const addEmployeeInfo = async () => {
    var roles = await getRoles();
    var managers = await getManagers();

    let addEmployeePrompts = await inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "What is the first name of the employee you'd like to add?",
        },
        {
            type: "input",
            name: "last_name",
            message: "What is the last name of the employee you'd like to add?",
        },
        {
            type: "list",
            name: "role",
            message: "What is the new employee's role?",
            choices: roles,
        },
        {
            type: "list",
            name: "manager",
            message: "Who is the new employee's manager?",
            choices: managers
        }

    ])
    var role_id = addEmployeePrompts.role;
    var manager_id = addEmployeePrompts.manager;
    const insertEmployee = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ("${addEmployeePrompts.first_name}", "${addEmployeePrompts.last_name}", ${role_id}, ${manager_id});`;
    db.query(insertEmployee, (err, result) => {
        if (err) { console.log(err); }
        console.log("New employee added")
        prompt();
    })

}

const updateEmployeeInfo = async () => {
    var roles = await getRoles();
    var employees = await getEmployees();

    let updateEmployeePrompts = await inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Which employee would you like to update?",
            choices: employees
        },
        {
            type: "list",
            name: "role",
            message: "What is the employee's new role?",
            choices: roles,
        },

    ])
    var role_id = updateEmployeePrompts.role;
    var employee_id = updateEmployeePrompts.employee
    const updateRole = `UPDATE employee
                    SET role_id = ${role_id} WHERE id = ${employee_id}`;
    db.query(updateRole, (err, result) => {
        if (err) { console.log(err); }
        console.log("Employee updated")
        prompt();
    })

}

const getRoles = async () => {
    var roleCall = "SELECT id, title FROM roles";
    var result = await db.promise().query(roleCall);
    let array = JSON.stringify(result[0]);
    let parse = JSON.parse(array);
    var roles = [];
    for (i = 0; i < parse.length; i++) {
        let temp = parse[i].title;
        var role = { name: temp, value: JSON.stringify(parse[i].id) }
        roles.push(role)
    }
    return roles;
}


const getManagers = async () => {
    var managerCall = `SELECT m.id, CONCAT(m.first_name, ' ', m.last_name) AS Manager
        FROM employee
        LEFT JOIN employee m
        ON employee.manager_id = m.id
        WHERE employee.manager_id IS NOT NULL`;
    var result = await db.promise().query(managerCall);
    let array = JSON.stringify(result[0]);
    let parse = JSON.parse(array);
    var managers = [];
    for (i = 0; i < parse.length; i++) {
        let temp = parse[i].Manager;
        var manager = { name: temp, value: JSON.stringify(parse[i].id) }
        managers.push(manager)
    }
    return managers;
}

const getEmployees = async () => {
    var employeeCall = `SELECT id, CONCAT(first_name, ' ', last_name) AS Name FROM employee`;
    var result = await db.promise().query(employeeCall);
    let array = JSON.stringify(result[0]);
    let parse = JSON.parse(array);
    var employees = [];
    for (i = 0; i < parse.length; i++) {
        let temp = parse[i].Name;
        var employee = { name: temp, value: JSON.stringify(parse[i].id) }
        employees.push(employee)
    }
    return employees;
}

