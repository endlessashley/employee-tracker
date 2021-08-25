DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db

SELECT DATABASE();

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
    );

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT NOT NULL
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id: INT
);

INSERT INTO department (department_name)
VALUES ("Finance", 1),
       ("Research and Development", 2),
       ("Marketing", 3),
       ("Human Resources", 4);

INSERT INTO roles (role_title, role_salary, department_id)
VALUES  ("Accountant", 55000, 1),
        ("Engineer", 82000, 2),
        ("Technician", 65000, 2),
        ("Chief Marketing Officer", 200000, 3),
        ("Social Media Specialist", 45000, 3),
        ("HR Specialist", 60000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Norma", "Jennings", 1, NULL),
        ("Dale", "Cooper", 2, NULL),
        ("Harry", "Truman", 3, 2),
        ("Donna", "Hayward", 4, NULL),
        ("Audrey", "Horne", 5, 4), 
        ("Shelly", "Johnson", 6, NULL);

