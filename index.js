const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');
const chalk = require('chalk');
require('dotenv').config();


const connection = mysql.createConnection(    
    {
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

const start = () => {
    console.log(`
    `);
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View departments',
            'View roles',
            'View employees',
            'View employees by manager',
            'Add department',
            'Add roles',
            'Add employee',
            'Update employee role',
            'Update employee manager',
            // 'Delete department',
            // 'Delete roles',
            // 'Delete employee',
            // 'View department personnel budget',
            'EXIT'
        ],
    })
        .then(answer => {
            switch (answer.action) {
                case 'Add department':
                    addDept();
                    break;
                case 'Add roles':
                    addRole();
                    break;
                case 'Add employee':
                    addEmp();
                    break;
                case 'View departments':
                    viewDept();
                    break;
                case 'View roles':
                   viewRole();
                    break;
                case 'View employees':
                    viewEmp();
                    break;
                case 'Update employee role':
                    updateRole();
                    break;
                case 'Update employee manager': 
                    updateMgr();
                    break;
                case 'View employees by manager':
                    viewMgr();
                    break;
                // case 'Delete department':
                //     deleteDept();
                //     break;
                // case 'Delete roles':
                //     deleteRole();
                //     break;
                // case 'Delete employee':
                //     deleteEmp();
                //     break;
                // case 'View department personnel budget':
                //     viewBudget();
                //     break;
                case 'EXIT':
                    console.log(chalk.magentaBright('Goodbye'));
                    connection.end();
                    break;
                default:
                    console.log(chalk.red(`Not a valid selection ${answer.action}`));
                    break;
            }
        });
};

//ADD A DEPARTMENT - Required
const addDept = () => {
    inquirer.prompt({
        name: 'name',
        type: 'input',
        message: 'Enter a department to add.'
    })
        .then((answer) => {
            connection.query('INSERT INTO department SET ?',
                {
                    name: answer.name,
                },
                (err) => {
                    if (err) throw err;
                    start();
                })
        })
}

//ADD A ROLE - Required
const addRole = () => {
let department_id;
    connection.query('SELECT * FROM department',
        (err, res) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'department',
                    type: 'list',
                    message: 'Select the department for the role.',
                    choices: () => {
                        const departments = [];
                        for (const item of res) {
                            departments.push({
                                name: item.name,
                                value: item.id
                            });
                        }
                        return departments;
                    },
                },
            ])
                .then((answer) => {
                    department_id = answer.department;
                    inquirer.prompt([
                        {
                            name: 'title',
                            type: 'input',
                            message: 'Enter the role\'s title to add.'
                        },
                        {
                            name: 'salary',
                            type: 'input',
                            message: 'Enter the role salary.',
                            validate(value) {
                                if (isNaN(value) === false) {
                                    return true;
                                }
                                return false;
                            },
                        },
                    ])
                        .then((answer) => {
                            connection.query('INSERT INTO role SET ?',
                                {
                                    title: answer.title,
                                    salary: answer.salary,
                                    department_id: department_id,
                                },
                                (err) => {
                                    if (err) throw err;
                                    console.log('');
                                    viewRole();
                                    start();
                                });
                        });
                });
        });
}

//ADD AN EMPLOYEE - Required
const addEmp = () => {
    let department_id;
    let role_id;
    let manager_id;
    connection.query(
        `SELECT * FROM department`,
        (err, res) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'department',
                    type: 'list',
                    message: 'Select the department of the new employee.',
                    choices: () => {
                        let departments = [];
                        for (const item of res) {
                            departments.push({ 
                                name: item.name, 
                                value: item.id
                            });
                        }
                        return departments;
                    },
                },
            ])
                .then((answer) => {
                    department_id = answer.department;
                    connection.query(
                        `SELECT * FROM role 
                            WHERE department_id = ${answer.department}`,
                        (err, res) => {
                            if (err) throw err;
                            inquirer.prompt([
                                {
                                    name: 'title',
                                    type: 'list',
                                    message: 'Select the role of the new employee.',
                                    choices: () => {
                                        let roles = [];
                                        for (const item of res) {
                                            roles.push({ 
                                                name: item.title, 
                                                value: item.id
                                            });
                                        }
                                        return roles;
                                    },
                                },
                            ])
                                .then((answer) => {
                                    role_id = answer.title;
                                    connection.query(
                                        `SELECT employee.id, employee.first_name, employee.last_name, employee.role_id, employee.manager_id 
                                            FROM employee
                                            INNER JOIN role
                                                ON employee.role_id = role.id
                                            LEFT JOIN department
                                                ON department.id = role.department_id
                                            LEFT JOIN employee m
                                                ON employee.manager_id = m.id
                                                WHERE department.id = ${department_id} AND m.id IS NULL`,
                                          (err, res) => {
                                            if (err) throw err;
                                            
                                            inquirer.prompt([
                                                {
                                                    name: 'manager',
                                                    type: 'list',
                                                    message: 'Select the new employee\'s manager',
                                                    choices: () => {
                                                        let managers = [];
                                                        for (const item of res) {
                                                            managers.push({
                                                                name: `${item.first_name} ${item.last_name}`,
                                                                value: item.id,
                                                            });
                                                        }
                                                        return managers;
                                                    },
                                                },
                                            ])
                                                .then((answer) => {
                                                    manager_id = answer.manager;
                                                    inquirer.prompt([
                                                        {
                                                            name: 'first_name',
                                                            type: 'input',
                                                            message: 'Enter the employee\'s first name.',
                                                        },
                                                        {
                                                            name: 'last_name',
                                                            type: 'input',
                                                            message: 'Enter the employee\'s last name.',
                                                        },
                                                    ])
                                                        .then((answer) => {
                                                            connection.query(
                                                                `INSERT INTO employee SET ?`,
                                                                {
                                                                    first_name: answer.first_name,
                                                                    last_name: answer.last_name,
                                                                    role_id: role_id,
                                                                    manager_id: manager_id,
                                                                },
                                                                (err) => {
                                                                    if (err) throw err;
                                                                    viewEmp();
                                                                    start();
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });
}

//VIEW DEPARTMENT - Required
const viewDept = () => {
    connection.query(
        `SELECT name AS department 
            FROM department`,
        (err, res) => {
            if (err) throw err;
            console.log('');
            console.table(res);
            start();
        })
}

//VIEW ROLE - Required
const viewRole = () => {
connection.query(
    `SELECT role.title, role.salary, department.name AS department
        FROM department 
        INNER JOIN role 
            ON department.id = role.department_id`,
 (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
})
}

//VIEW EMPLOYEES LIST - Required
const viewEmp = () => {
connection.query(
    `SELECT employee.first_name, employee.last_name, role.title, role.salary, 
            CONCAT(mgr.first_name, ' ', mgr.last_name) AS manager
        FROM employee
        LEFT JOIN role
            ON employee.role_id = role.id
        LEFT JOIN employee mgr
            ON employee.manager_id = mgr.id`,
  (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
})
}

//VIEW EMPLOYEES BY MANAGER - Bonus
const viewMgr = () => {
    connection.query(
        `SELECT CONCAT(mgr.first_name, ' ', mgr.last_name) AS manager,
                CONCAT(employee.first_name, ' ', employee.last_name) AS employee, role.title
            FROM employee
            LEFT JOIN employee mgr
                ON employee.manager_id = mgr.id
            LEFT JOIN role
                ON employee.role_id = role.id
            ORDER BY mgr.id`,
        (err, res) => {
            if (err) throw err;
            console.table(res);
            start();
        })
}

//UPDATE ROLE - Required
const updateRole = () => {
    let employee_id;
    let role_id;
    connection.query(
        `SELECT emp.first_name, emp.last_name, emp.id 
            FROM employee emp`,
        (err, res) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'select the employee\'s role to update.',
                    choices: () => {
                        let employees = [];
                        for (const item of res) {
                            employees.push({
                                name: `${item.first_name} ${item.last_name}`,
                                value: item.id,
                            });
                        }
                        return employees;
                    },
                },
            ])
                .then((answer) => {
                    employee_id = answer.employee_id;
                    connection.query(`SELECT * FROM role`, (err, res) => {
                        if (err) throw err;
                        inquirer.prompt([
                            {
                                name: 'title',
                                type: 'list',
                                message: 'Select the employee\'s new role.',
                                choices: () => {
                                    let roles = [];
                                    for (const item of res) {
                                        roles.push({ 
                                            name: item.title, 
                                            value: item.id,
                                        });
                                    }
                                    return roles;
                                },
                            },
                        ])
                            .then((answer) => {
                                role_id = answer.title;
                                connection.query(
                                    `UPDATE employee SET ? WHERE ?`,
                                    [
                                        {
                                            role_id: role_id,
                                        },
                                        {
                                            id: employee_id,
                                        },
                                    ],
                                    (err) => {
                                        if (err) throw err;
                                        viewEmp();
                                        start();
                                    }
                                );
                            });
                    });
                });
        });
}

//UPDATE MANAGER ID - Bonus
const updateMgr = () => {
    let employee_id;
    let manager_id;
    connection.query(
        `SELECT first_name, last_name, id, manager_id
            FROM employee`,
        (err, res) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Select the employee to update the manager',
                    choices: () => {
                        let employees = [];
                        for (const item of res) {
                            employees.push({
                                name: `${item.first_name} ${item.last_name}`,
                                value: item.id,
                            });
                        }
                        return employees;
                    },
                },
            ])
                .then((answer) => {
                    employee_id = answer.employee;
                    connection.query(
                        `SELECT id, first_name, last_name, manager_id 
                            FROM employee  
                            WHERE id IN (SELECT manager_id FROM employee)`,
                        (err, res) => {
                            if (err) throw err;
                            inquirer.prompt([
                                {
                                    name: 'manager',
                                    type: 'list',
                                    message: 'Select the new manager.',
                                    choices: () => {
                                        let managers = [];
                                        for (const item of res) {
                                            managers.push({
                                                name: `${item.first_name} ${item.last_name}`,
                                                value: item.id,
                                            });
                                        }
                                        return  managers;
                                    },
                                },
                            ])
                                .then((answer) => {
                                    manager_id = answer.manager;
                                    connection.query(
                                        `UPDATE employee SET ? WHERE ?`,
                                        [
                                            {
                                                manager_id: manager_id,
                                            },
                                            {
                                                id: employee_id,
                                            },
                                        ],
                                        (err) => {
                                            if (err) throw err;
                                            console.log('');
                                            viewEmp();
                                            start();
                                        }
                                    );
                                });
                        });
                });
        });
}
/*===========================
//DELETE A DEPARTMENT - bonus
const deleteDept = () => {
}

//DELETE ROLE - bonus
const deleteRole = () => {
}

//DELETE EMPLOYEE - bonus
const deleteEmp = () => {
}

//VIEW THE BUDGET - bonus
const viewBudget = () => {
}
============================*/
connection.connect(err =>{
    if(err) throw (err);
    start();
})
