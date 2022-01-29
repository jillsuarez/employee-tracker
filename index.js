const fs = require("fs");
const path = require('path');
const inquirer = require('inquirer')
// const cTable = require('console.table');
const mysql = require('mysql2');
const db = require("./connection");


// console.table([
//     {
//       name: 'foo',
//       age: 10
//     }, {
//       name: 'bar',
//       age: 20
//     }
//   ]);
  

function logDepartments(){
    db.query("SELECT * FROM department");
};

function promptUser() {
    const userOptions = [
    {
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: ['View all departments','View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update and employee role']
    },
    {
        type: "confirm",
        name: "viewDepartments",
        message: "Are you sure you'd like to view all departments?",
        when: confirmOption => confirmOption.option === 'View all departments',
        validate: answer => {
            if (answer == 'y') {
                return logDepartments();
            } 
            return promptUser();
        }
    }
    ]}