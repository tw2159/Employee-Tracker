USE employees;

INSERT INTO department
  (name)
VALUES
  ("Sales"),
  ("Engineering"),
  ("Finance"),
  ("Legal");

INSERT INTO role
  (title, salary, department_id)
VALUES 
  ("Sales Lead", 100000, 1),
  ("Salesperson", 80000, 1),
  ("Lead Engineer", 150000, 2),
  ("Software Engineer", 120000, 2),
  ("Accountant", 125000, 3),
  ("Legal Team Lead", 250000, 4),
  ("Lawyer", 190000, 4);

INSERT INTO employee
  (first_name, last_name, role_id, manager_id)
VALUES
  ("John", "Doe", 1, 3),
  ("Mike", "Chan", 2, 1),
  ("Ashley", "Rodriguez", 3, NULL),
  ("Kevin", "Tupik", 4, 3),
  ("Malia", "Brown", 5, NULL),
  ("Sarah", "Lourd", 6, NULL),
  ("Tom", "Allen", 7, 6),
  ("Christian", "Eckenrode", 3, 2),
  ("Tanner", "Galal", 4, 4);