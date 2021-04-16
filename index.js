const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');
require('dotenv').config();
const util = require('util');

const connection = mysql.createConnection(    
    {
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

const queryAsync = util.promisify(connection.query)

const start = () => {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'Add department',
            'Add roles',
            'Add employee',
            'View departments',
            'View roles',
            'View employees',
            'Update employee roles',
            'Update employee manager',
            'View employees by manager',
            'Delete department',
            'Delete roles',
            'Delete employee',
            'View department personnel budget',
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
                case 'Update employee roles':
                    updateRole();
                    break;
                case 'Update employee manager': +
                    updateMgr();
                    break;
                case 'View employees by manager':
                    viewMgr();
                    break;
                case 'Delete department':
                    deleteDept();
                    break;
                case 'Delete roles':
                    deleteRole();
                    break;
                case 'Delete employee':
                    deleteEmp();
                    break;
                case 'View department personnel budget':
                    viewBudget();
                    break;
                case 'EXIT':
                    console.log('Goodbye')
                    connection.end();
                    break;
                default:
                    console.log(`Not a valid selection ${answer.action}`);
                    break;
            }
        });
};

//ADD A DEPARTMENT
//COMPLETE - WORKS
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
                (err, res) => {
                    
                    if (err) throw err;
                    console.log(`${answer.name} was added.`);
                    start();
                })
        })
}
//ADD A ROLE
//COMPLETE - WORKS
const addRole = () => {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
    inquirer
    .prompt([
        {
            name: 'title',
            type: 'input',
            message: 'Enter the role title to add.'
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
        {
          name: 'name',
          type: 'rawlist',
          department() {
            const departments = [];
            res.forEach(({ name }) => {
              departments.push(name);
            });
            return departments;
          },
          message: 'Select the department for the role.',        
        
}
])
    .then((answer) => {
        let department_id;
        res.forEach((name) => {
            if (name.name === answer.name) {
                department_id = name;
              }
        })
        connection.query('INSERT INTO role SET ?',        
        {
            title: answer.title,
            salary: answer.salary,
            department_id: department_id.department_id,
        },
       (err,res) => {
           if (err) throw err;
           
           start();
        })
    })
    })
}

/*===========================
**************IN PROGRESS****************
TODO: Look into promisify using notes below from office hours , this includes lines 16 and 5 
//ADD AN EMPLOYEE


const addEmp = () => {

    let roles = connection.query('SELECT title, salary FROM role');
    let managers = queryAsync(`SELECT CONCAT(first_name, " ", last_name) AS employee, role.title, department.name AS department 
    FROM employee 
    LEFT JOIN role ON employee.role_id = role.id 
    LEFT JOIN department ON department.id = role.department_id`);

    inquirer
        .prompt([
            {
                name: 'first_name',
                type: 'input',
                message: 'Enter the first name.',
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'Enter the last name.',
            },

            //USER CHOOSES THE ROLE FROM LIST
            ///.then call function that will add on more questions
            {
                name: 'role_id',
                type: 'rawlist',
                roles(roles) {

                    roles = [];
                    res.forEach(({ role }) => {
                        roles.push(role);
                    });
                    return roles;

                },
                message: 'Select the role for the employee.',

            },
            ////THEN HAVE USER SELECT THE MANAGER FROM LIST
            {
                name: 'manager_id',
                type: 'rawlist',
                managers.then(managers) {

                    managers = [];
                    res.forEach(({ manager }) => {
                        managers.push(manager);
                    });
                    return managers;

                },
                message: 'Select the manager for the employee.',

            }
        ])
        .then((answers) => {
            let role_id;
            res.forEach((role) => {
                if (roles.role === answers.role) {
                    role_id = role;
                }
            });

            let manager_id;
            res.forEach((manager) => {
                if (managers.manager === answers.manager) {
                    manager_id = manager;
                }
            });

            connection.query('INSERT INTO role SET ?',
                {
                    first_name: answers.first_name,
                    last_name: answers.last_name,
                    role_id: answers.role_id,
                    manager_id: answers.manager_id,
                },
                (err, res) => {
                    if (err) throw err;
                    start();
                })
        })
}
============================*/
//VIEW DEPARTMENT
//COMPLETE - WORKS
const viewDept = () => {    
        connection.query('SELECT name FROM department AS department', (err, res) => {
            if (err) throw err;
            console.table(res);
            start();
        })
}

//VIEW ROLE
//COMPLETE - WORKS
const viewRole = () => {
connection.query(
    `SELECT role.title, role.salary, department.name 
        FROM department 
        INNER JOIN role ON department.id = role.department_id`,
 (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
})
}

/*===========================
REWORK ME****************
TODO: Shoule be more like the view employee
//VIEW EMPLOYEES LIST
============================*/
const viewEmp = () => {
connection.query(
    `SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
        CONCAT(mgr.first_name, ' ', mgr.last_name) AS manager
        FROM employee
        LEFT JOIN role
        ON employee.role_id = role.id
        LEFT JOIN department
        ON department.id = role.department_id
        LEFT JOIN employee mgr
        ON employee.manager_id = mgr.id
        ORDER BY department.name`,
  (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
})
}

/*===========================
REWORK ME****************
TODO: Shoule be more like the view employee
//VIEW EMPLOYEES BY MANAGER
============================*/
const viewMgr = () => {
    connection.query(
        ` SELECT CONCAT(first_name, ' ', last_name) AS employee, role.title, department.name AS department
         FROM employee WHERE manager_id is NULL
         LEFT JOIN role
         ON employee.role_id = role.id
         LEFT JOIN department
           ON department.id = role.department_id`,
           (err, res) => {
             if (err) throw err;
             console.table(res);
             start();
         })
         }

/*===========================
******************COMPLETE ME
//UPDATE ROLE
const updateRole = () => {
    
}
============================*/

/*===========================
******************COMPLETE ME
//UPDATE MANAGER ID

const updateMgr = () => {

}
============================*/

/*===========================
******************COMPLETE ME
//DELETE A DEPARTMENT
const deleteDept = () => {
}

/*===========================
******************COMPLETE ME
//DELETE ROLE
const deleteRole = () => {
}

/*===========================
******************COMPLETE ME
//DELETE EMPLOYEE


const deleteEmp = () => {
}
============================*/

/*===========================
******************COMPLETE ME
//VIEW THE BUDGET
TO DO: calculate all the salaries

const viewBudget = () => {
}
============================*/

connection.connect(err =>{
    if(err) throw (err);
    start();
})
