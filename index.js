const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');
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

//ADD A DEPARTMENT - Required
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
//ADD A ROLE - Required
//COMPLETE - WORKS
const addRole = () => {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
    inquirer.prompt([
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
          choices() {
            const departments = [];
            res.forEach(({ name }) => {
              departments.push(name);
            });
            return departments;
          },
          message: 'Select the department for the role.',
        },
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

//ADD AN EMPLOYEE - Required
//COMPLETE - WORKS
const addEmp = () => {
    connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
    inquirer.prompt([
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
        {
          name: 'title',
          type: 'rawlist',
          choices() {
            const roles = [];
            res.forEach(({ title }) => {
              roles.push(title);
            });
            return roles;
          },
          message: 'Select the employee\'s title.',
        },
])
    .then((answer) => {
        let role_id;
        res.forEach((role_id) => {
            if (roles.role === answer.role) {
               role_id = role;
              }
        })
        connection.query('INSERT INTO employee SET ?',        
        {
            first_name: answer.first_name,
            last_name: answer.last_name,
           role_id: role_id.role_id,
        //    manager_id: manager_id.manager_id,
        },
       (err,res) => {
           if (err) throw err;
           
           start();
        })
    })
    })
}

//VIEW DEPARTMENT - Required
//COMPLETE - WORKS
const viewDept = () => {    
        connection.query('SELECT name AS departmentFROM department', (err, res) => {
            if (err) throw err;
            console.table(res);
            start();
        })
}

//VIEW ROLE - Required
//COMPLETE - WORKS
const viewRole = () => {
connection.query(
    `SELECT role.title, role.salary, department.name AS department
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
TODO: 
//VIEW EMPLOYEES LIST - Required
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
TODO: Should be more like the view employee
//VIEW EMPLOYEES BY MANAGER - Bonus
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
//UPDATE ROLE - Required
const updateRole = () => {
    
}
============================*/

/*===========================
******************COMPLETE ME
//UPDATE MANAGER ID - Bonus

const updateMgr = () => {

}
============================*/

/*===========================
******************COMPLETE ME
//DELETE A DEPARTMENT - bonus
const deleteDept = () => {
}

/*===========================
******************COMPLETE ME
//DELETE ROLE - bonus
const deleteRole = () => {
}

/*===========================
******************COMPLETE ME
//DELETE EMPLOYEE - bonus


const deleteEmp = () => {
}
============================*/

/*===========================
******************COMPLETE ME
//VIEW THE BUDGET - bonus
TO DO: calculate all the salaries

const viewBudget = () => {
}
============================*/

connection.connect(err =>{
    if(err) throw (err);
    start();
})
