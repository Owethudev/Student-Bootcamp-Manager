Student Bootcamp Manager

This JavaScript console application registers bootcamp students, calculates their averages and results, processes them asynchronously, and prints a class report.

Features

The application registers students with unique IDs, courses, and any number of marks. It uses a default course and a passing mark of 50, which can be changed in the configuration. It reports students as PASS, FAIL, or PENDING when they have no marks. It validates student details and processing requests.

Technologies

The project uses JavaScript with Node.js. It has no third-party dependencies.

How to run

Install Node.js and run `node index.js` from the project directory. Run the tests with `node --test`.

Application plan

Student records are validated and stored privately by the manager. The application calculates averages and results, processes each student asynchronously, then prints individual student details and class totals. Returned student data is copied so changes to it do not alter the stored records.

Module 4 concepts

The application demonstrates default parameters for the course and configuration, rest parameters for marks, and spread syntax for copying and passing marks. Closures protect the student store and processing counter. An IIFE keeps configuration private. Functions are passed as values, and `processStudents` is a higher-order function that accepts a processor. Callbacks handle asynchronous processing with `setTimeout()`.

The report formatter uses `this`. The application uses `call()` to format the title, `apply()` to provide summary values, and `bind()` to save a formatter for later. A generator uses `yield` to produce student IDs, and the manager requests IDs with `.next()`.

Challenges and solutions

Students without marks would cause an invalid average, so the application returns no average and marks their status as PENDING. To keep the report in registration order, students are processed one at a time, with each callback starting the next. To prevent outside code from changing stored marks, the manager copies student data when it is registered and returned.

Day-by-day checkpoints

Day 1 focused on registration, courses, marks, averages, and status. Day 2 added the advanced JavaScript concepts. Day 3 added asynchronous processing, tests, and the final report. The final submission includes the application and this README.
