const mysql = require("mysql2");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "weite19900325*",
  database: "employees"
});

connection.connect(function(err) {
  if(err) {
    throw err;
  }
  init();
});

function submitQuery(query, output) {
  connection.query(query, (err, res) => {
    if(err) {
      console.log(err);
    }
    // Display the query result if the output parameter is true
    if(output) {
      console.table(res);
    }
    init();
  });
}

function viewAllDepartments() {
  const query = `SELECT * FROM department`;
  submitQuery(query, true);
}

function viewAllRoles() {
  const query = `SELECT role.id, role.title, role.salary, department.name AS department
                 FROM role
                 LEFT JOIN department ON role.department_id = department.id`;
  submitQuery(query, true);
}

function viewAllEmployees() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                 FROM employee
                 LEFT JOIN role ON employee.role_id = role.id
                 LEFT JOIN department ON role.department_id = department.id
                 LEFT JOIN employee manager ON manager.id = employee.manager_id`;
  submitQuery(query, true);
}

function viewAllManagers() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, department.name as department
                 FROM employee
                 LEFT JOIN role on role.id = employee.role_id
                 LEFT JOIN department on department.id = role.department_id
                 WHERE employee.id IN ( SELECT employee.manager_id FROM employee );`;
  submitQuery(query, true);
}

function viewDepartmentBudget() {
  const query = `SELECT department_id, department.name, SUM(salary) AS budget
                 FROM role
                 INNER JOIN department ON role.department_id = department.id
                 GROUP BY role.department_id`;
  submitQuery(query, true);
}

function addDepartment() {
  const questions = [
    {
      type: "input",
      name: "name",
      message: "What department would you like to add?",
      validate: answer => {
        if(answer == "") {
          return "Please enter a valid department!";
        }
        else {
          return true;
        }
      }
    }
  ];

  inquirer
    .prompt(questions)
    .then(answer => {
      const query = `INSERT INTO department (name)
                     VALUES ("${answer.name}")`;
      submitQuery(query, false);
      console.log("\nSuccessfully added the department!\n");
    });
}

function addRole() {
  connection.query("SELECT * FROM department", (err, res) => {
    if(err) {
      console.log(err);
    }
    const departments = res.map(
      ({id, name}) => ({
        name: name,
        value: id
      })
    );
    const questions = [
      {
        type: "input",
        name: "title",
        message: "What is the title of the role?",
        validate: answer => {
          if(answer == "") {
            return "Please enter a valid title!";
          }
          else {
            return true;
          }
        }
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary?",
        validate: answer => {
          if(answer == "" || answer < 0) {
            return "Please enter a valid salary!";
          }
          else {
            return true;
          }
        }
      },
      {
        type: "list",
        name: "department",
        message: "What department does this role belong to?",
        choices: departments
      }
    ];
    inquirer
      .prompt(questions)
      .then(answer => {
        const query = `INSERT INTO role (title, salary, department_id)
                       VALUES ("${answer.title}", ${answer.salary}, ${answer.department})`;
        submitQuery(query, false);
        console.log("\nSuccessfully added the role!\n");
      });
  });
}

function addEmployee() {
  connection.query("SELECT role.id, role.title FROM role", (err, res) => {
    if(err) {
      console.log(err);
    }
    const roles = res.map(
      ({id, title}) => ({
        name: title,
        value: id
      })
    );
    const questions = [
      {
        type: "input",
        name: "first_name",
        message: "What is the first name of the employee?",
        validate: answer => {
          if(answer == "") {
            return "Please enter a valid name!";
          }
          else {
            return true;
          }
        }
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the last name of the employee?",
        validate: answer => {
          if(answer == "") {
            return "Please enter a valid name!";
          }
          else {
            return true;
          }
        }
      },
      {
        type: "list",
        name: "role",
        message: "Which role does this employee have?",
        choices: roles
      }
    ];
    inquirer
      .prompt(questions)
      .then(answer => {
        const query = `INSERT INTO employee (first_name, last_name, role_id)
                       VALUES ("${answer.first_name}", "${answer.last_name}", ${answer.role})`;
        submitQuery(query, false);
        console.log("\nSuccessfully added the employee!\n");
      });
  });
}

function updateEmployeeRole() {
  connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee", (err, res) => {
    if(err) {
      console.log(err);
    }
    const employees = res.map(
      ({id, first_name, last_name}) => ({
        name: `${first_name} ${last_name}`,
        value: id
      })
    );
    const questions = [
      {
        type: "list",
        name: "employee",
        message: "Which employee would you like to update?",
        choices: employees
      }
    ];
    inquirer
      .prompt(questions)
      .then(answer => {
        let selectedEmployee = answer.employee;

        connection.query("SELECT role.id, role.title FROM role", (err, res) => {
          if(err) {
            console.log(err);
          }
          const roles = res.map(
            ({id, title}) => ({
              name: title,
              value: id
            })
          );
          const questions = [
            {
              type: "list",
              name: "role",
              message: "Which role does the employee have?",
              choices: roles
            }
          ];
          inquirer
            .prompt(questions)
            .then(answer => {
              const query = `UPDATE employee
                             SET role_id = ${answer.role}
                             WHERE id = ${selectedEmployee}`;
              submitQuery(query, false);
              console.log("\nSuccessfully updated the employee's role!\n");
            });
        });    
      });
  });
}

function updateEmployeeManager() {
  connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee", (err, res) => {
    if(err) {
      console.log(err);
    }
    const employees = res.map(
      ({id, first_name, last_name}) => ({
        name: `${first_name} ${last_name}`,
        value: id
      })
    );
    const questions = [
      {
        type: "list",
        name: "employee",
        message: "Which employee would you like to update?",
        choices: employees
      }
    ];
    inquirer
      .prompt(questions)
      .then(answer => {
        let selectedEmployee = answer.employee;
        const questions2 = [
          {
            type: "list",
            name: "manager",
            message: "Who is the manager would you like to update for the employee?",
            choices: employees.filter(employee => employee.value != selectedEmployee)
          } 
        ];
        inquirer
          .prompt(questions2)
          .then(answer => {
              const query = `UPDATE employee
                             SET manager_id = ${answer.manager}
                             WHERE id = ${selectedEmployee}`;
              submitQuery(query, false);
              console.log("\nSuccessfully updated the employee's manager!\n");
          });
      });
  });
}

function deleteDepartment() {
  connection.query("SELECT * FROM department", (err, res) => {
    if(err) {
      console.log(err);
    }
    const departments = res.map(
      ({id, name}) => ({
        name: name,
        value: id
      })
    );
    const questions = [
      {
        type: "list",
        name: "department",
        message: "Which department would you like to delete?",
        choices: departments
      }
    ];
    inquirer
      .prompt(questions)
      .then(answer => {
        const query = `DELETE FROM department
                       WHERE id = ${answer.department}`;
        submitQuery(query, false);
        console.log("\nSuccessfully deleted the department!\n");
      });
  });
}

function deleteRole() {
  connection.query("SELECT role.id, role.title FROM role", (err, res) => {
    if(err) {
      console.log(err);
    }
    const roles = res.map(
      ({id, title}) => ({
        name: title,
        value: id
      })
    );
    const questions = [
      {
        type: "list",
        name: "role",
        message: "Which role would you like to delete?",
        choices: roles
      }
    ];
    inquirer
      .prompt(questions)
      .then(answer => {
        const query = `DELETE FROM role
                       WHERE id = ${answer.role}`;
        submitQuery(query, false);
        console.log("\nSuccessfully deleted the role!\n");
      });
  });
}

function deleteEmployee() {
  connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM employee", (err, res) => {
    if(err) {
      console.log(err);
    }
    const employees = res.map(
      ({id, first_name, last_name}) => ({
        name: `${first_name} ${last_name}`,
        value: id
      })
    );
    const questions = [
      {
        type: "list",
        name: "employee",
        message: "Which employee would you like to delete?",
        choices: employees
      }
    ];
    inquirer
      .prompt(questions)
      .then(answer => {
        const query = `DELETE FROM employee
                       WHERE id = ${answer.employee}`;
        submitQuery(query, false);
        console.log("\nSuccessfully deleted the employee!\n");
      });
  });
}

function displayMenu() {
  const questions = [
    {
      type: "list",
      name: "menu",
      message: "What would you like to do? ",
      choices: [
        "View All Departments",
        "View All Roles",
        "View All Employees",
        "View All Managers",
        "View Department Budget",
        "Add Department",
        "Add Role",
        "Add Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "Delete Department",
        "Delete Role",
        "Delete Employee",
        "Exit"
      ]
    }
  ];

  inquirer
    .prompt(questions)
    .then(answer => {
      switch(answer.menu) {
        case "View All Departments":
          viewAllDepartments();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "View All Employees":
          viewAllEmployees();
          break;
        case "View All Managers":
          viewAllManagers();
          break;
        case "View Department Budget":
          viewDepartmentBudget();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Update Employee Manager":
          updateEmployeeManager();
          break;
        case "Delete Department":
          deleteDepartment();
          break;
        case "Delete Role":
          deleteRole();
          break;
        case "Delete Employee":
          deleteEmployee();
          break;
        default:
          connection.end();
      }
    });
}

function init() {
  displayMenu();
}