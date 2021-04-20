DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

CREATE TABLE department(
id INT NOT NULL AUTO_INCREMENT,
name VARCHAR(30) NOT NULL,
PRIMARY KEY(id)
);
DROP TABLE employee;
DROP TABLE role;

CREATE TABLE role(
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT,
  PRIMARY KEY(id),
  FOREIGN KEY (department_id) 
    REFERENCES department(id)
);

CREATE TABLE employee(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY (role_id)
        REFERENCES role(id),
    FOREIGN KEY (manager_id) 
        REFERENCES employee(id)
);

-- ADD CONTRAINT TO THE FOREIGN KEYS SO CAN DELETE ROWS
ALTER TABLE role
    ADD CONSTRAINT 
    FOREIGN KEY (department_id) 
    REFERENCES department(id)
    ON DELETE CASCADE;
    
ALTER TABLE employee
    ADD CONSTRAINT 
	FOREIGN KEY (role_id)
	REFERENCES role(id)
	ON DELETE CASCADE;

ALTER TABLE employee
	ADD CONSTRAINT
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON DELETE CASCADE; 
    

-- ADD DEPARTMENT DATA
INSERT INTO department (name)
VALUES 
('Information Technology'),
('Human Resources'),
('Purchasing'),
('Operations'),
('Sales');

-- ADD ROLE DATA
INSERT INTO role (title, salary, department_id) VALUES 
    ('HR Manager', 134580, 
        (SELECT id FROM department WHERE name = 'Human Resources')),
    ('HR Specialist', 69950, 
        (SELECT id FROM department WHERE name = 'Human Resources')),
    ('Operations Manager', 125740, 
        (SELECT id FROM department WHERE name = 'Operations')),
    ('Operations Specialist', 78320, 
        (SELECT id FROM department WHERE name = 'Operations')),
    ('Purchasing Manager', 132660, 
        (SELECT id FROM department WHERE name = 'Purchasing')),
    ('Purchasing Agent', 72370, 
        (SELECT id FROM department WHERE name = 'Purchasing')),
    ('Information Systems Manager', 161730, 
        (SELECT id FROM department WHERE name = 'Information Technology')),
    ('Information Security Analysts', 107580, 
        (SELECT id FROM department WHERE name = 'Information Technology')),
    ('Computer Support Specialists', 60160, 
        (SELECT id FROM department WHERE name = 'Information Technology')),
    ('Sales Manager', 147580, 
        (SELECT id FROM department WHERE name = 'Sales')),
    ('Sales Representative', 75170, 
        (SELECT id FROM department WHERE name = 'Sales'));

-- ADD THE MANAGERS
INSERT INTO employee (first_name, last_name, role_id) VALUES
	('Jeanna', 'Ervin',
        (SELECT id FROM role WHERE title = 'HR Manager')),
    ('Buffy', 'Overson', 
        (SELECT id FROM role WHERE title = 'Purchasing Manager')),
	('Clorinda', 'Plata', 
        (SELECT id FROM role WHERE title = 'Information Systems Manager')),
	('Wilbur', 'Dee', 
        (SELECT id FROM role WHERE title = 'Sales Manager')),
	('Tobias', 'Accetta', 
        (SELECT id FROM role WHERE title = 'Operations Manager'));
        
-- ADD WORKERS
-- https://stackoverflow.com/questions/7383753/is-it-possible-to-use-the-same-table-twice-in-a-select-query/7384011
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
	('Chantay', 'Sproles',
        (SELECT id FROM role WHERE title = 'Purchasing Agent'), 
        (SELECT id FROM employee m WHERE last_name = 'Overson')),
	('Alaine', 'Fey',
		(SELECT id FROM role WHERE title = 'Operations Specialist'),
		(SELECT id FROM employee m WHERE last_name = 'Accetta')),  
	('Talia', 'Echols', 
        (SELECT id FROM role WHERE title = 'Information Security Analysts'),
        (SELECT id FROM employee m WHERE last_name = 'Plata')),
    ('Carina', 'Clogston', 
        (SELECT id FROM role WHERE title ='Computer Support Specialists'),
        (SELECT id FROM employee m WHERE last_name = 'Plata'));


SELECT * 
    FROM employee;

SELECT * 
    FROM department;
    
SELECT name 
    FROM department;
    
SELECT title, salary
	FROM role;

-- SHOW THE ROLES
SELECT role.title, role.salary, department.name
    FROM department
    INNER JOIN role
		ON department.id = role.department_id;

-- SHOW EMPLOYEE LIST
SELECT employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee
  LEFT JOIN role
	ON employee.role_id = role.id
  LEFT JOIN department
	ON department.id = role.department_id
  LEFT JOIN employee m
	ON employee.manager_id = m.id
    ORDER BY department.name;
    
    -- LIST MANAGERS
SELECT CONCAT(first_name, ' ', last_name) AS employee, role.title, department.name AS department
  FROM employee WHERE manager_id is NULL
  LEFT JOIN role
  ON employee.role_id = role.id
  LEFT JOIN department
	ON department.id = role.department_id;

-- DATA FOR VIDEO EXAMPLES:
Finance

Elsie Hoglund
    Finance Manager 151,510

Sheryl Stoneking
    Budget Analyst 82,690
    Hoglund

Kacy Wehner
    Financial Specialists 85,510
    Hoglund

Vincenzo Obryan
    Accountant 81,660
    Hoglund
