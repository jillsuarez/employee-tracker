const inquirer = require('inquirer')
require('console.table');
const db = require("./db/connection");

function logDepartments(){
    return db.promise().query("SELECT * FROM department")
    .then(([rows,columns]) => {
        return rows
    });
};

function logRoles(){
    return db.promise().query("SELECT role.id, role.title, role.salary, department.name FROM role LEFT JOIN department on department.id = role.department_id")
    .then(([rows,columns]) => {
        return rows
    });
};

function logEmployee(){
    return db.promise().query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name, employee.manager_id FROM employee LEFT JOIN role on role.id = employee.role_id LEFT JOIN department on department.id = role.department_id")
    .then(([rows,columns]) => {
        return rows
    });
};

function addDepartment(){
    const departmentAddition = [
        {
            type: "input",
            name: "newDepartment",
            message: "What is the name of the department?",
        }
    ]
    return inquirer.prompt(departmentAddition)
    .then(answer => {
        const departmentName = answer.newDepartment
        db.query(`INSERT INTO department (name) VALUES ('${departmentName}')`, (err , results) => {
            if(err) {
                throw err;
            }
            console.log(`Added ${departmentName} to the database`);
        });
        promptUser();
    })
};

function addRole(){
    logDepartments().then(dept => {
        const roleAddition = [
            {
                type: "input",
                name: "newRoleTitle",
                message: "What is the title of the role?",
            }, 
            {
                type: "input",
                name: "newRoleSalary",
                message: "What is the salary of the role?",
            },
            {
                type: "list",
                name: "newRoleDept",
                choices: dept,
            }
        ]
        return inquirer.prompt(roleAddition)
        .then(answer => {
            const roleTitle = answer.newRoleTitle
            const roleSalary = answer.newRoleSalary
            const roleDepartment = answer.newRoleDept
            const departmentId = dept.filter( allDept => allDept.name === roleDepartment)[0].id;
            db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${roleTitle}', ${roleSalary}, ${departmentId})`, 
            (err , results) => {
                    if(err) {
                        throw err;
                    }
                    console.log(`Added ${roleTitle} to the database`);
            });
            promptUser();
        })
    })
   
};

function addEmployee(){
    db.promise().query('SELECT employee.id, first_name, last_name, role.id as "roleId", role.title FROM employee LEFT JOIN role on role.id = employee.role_id').then(([rows,columns]) => {
        let role = [];
        let employee = [];
        rows.forEach(data => {
            let roleObj = {
                id: data.roleId,
                name: data.title
            };
            let employeeObj = {
                id: data.id,
                name: data.first_name + " " + data.last_name
            }
            role.push(roleObj);
            employee.push(employeeObj);
        })
        const employeeAddition = [
            {
                type: "input",
                name: "employeeFirstName",
                message: "What is the employee's first name?",
            }, 
            {
                type: "input",
                name: "employeeLastName",
                message: "What is the employee's last name?",
            },
            {
                type: "list",
                name: "employeeRole",
                choices: role,
            },
            {
                type: "list",
                name: "employeeManager",
                choices: employee,
            }
        ]
        return inquirer.prompt(employeeAddition)
        .then(answer => {
            const roleId = role.filter( allRole => allRole.name === answer.employeeRole)[0].id;
            const managerId = employee.filter(allemployee => allemployee.name === answer.employeeManager)[0].id;
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${answer.employeeFirstName}', '${answer.employeeLastName}', ${roleId}, ${managerId})`, 
            (err , results) => {
                    if(err) {
                        throw err;
                    }
                    console.log(`Added ${answer.employeeFirstName} ${answer.employeeLastName} to the database`);
                    promptUser();
            });
        })
    })
};

function updateEmployee(){
    db.promise().query('SELECT employee.id, first_name, last_name, role.id as "roleId", role.title FROM employee LEFT JOIN role on role.id = employee.role_id').then(([rows,columns]) => {
        let role = [];
        let employee = [];
        rows.forEach(data => {
            let roleObj = {
                id: data.roleId,
                name: data.title
            };
            let employeeObj = {
                id: data.id,
                name: data.first_name + " " + data.last_name
            }
            role.push(roleObj);
            employee.push(employeeObj);
        })
        const employeeUpdate = [
            {
                type: "list",
                name: "employee",
                message: "Which employees role do you want to update?",
                choices: employee
            }, 
            {
                type: "list",
                name: "updatedRole",
                message: "What would you like to update the role to?",
                choices: role
            },
        ]
        return inquirer.prompt(employeeUpdate)
        .then(answer => {
            const roleId = role.filter( allRole => allRole.name === answer.updatedRole)[0].id;
            const employeeId = employee.filter(allemployee => allemployee.name === answer.employee)[0].id;
            db.query(`UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId}`, 
            (err , results) => {
                    if(err) {
                        throw err;
                    }
                    console.log(`Updated ${answer.employee} role to ${answer.updatedRole} in the database`);
                    promptUser();
            });
        })
    })
};

function promptUser() {
    const userOptions = [
    {
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: ['View all departments','View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role','End']
    }
    ]
    return inquirer.prompt(userOptions).then(answer => {
        if(answer) {
            switch (answer.options) {
                case 'View all departments':
                    logDepartments().then(data => {
                        console.table(data);
                        promptUser();
                    });
                    break;
                case  'View all roles':
                    logRoles().then(data => {
                        console.table(data);
                        promptUser();
                    });
                    break;
                case  'View all employees':
                    logEmployee().then(data => {
                        console.table(data);
                        promptUser();
                    });
                    break;
                case  'Add a department':
                    addDepartment();
                    break;
                case  'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case  'Update an employee role':
                    updateEmployee();
                    break;
                case 'End':
                    process.exit();
            }
            
        }
    
    });
};
promptUser();
