'use strict';

const {
  applicationConfig,
  createStudentManager,
  processStudents,
} = require('./src/student-manager');

const manager = createStudentManager();

const studentRecords = [
  { name: 'Amina Patel', course: 'JavaScript Foundations', marks: [82, 76, 91] },
  { name: 'Brian Dlamini', course: 'Web Development', marks: [48, 52] },
  { name: 'Chipo Moyo', marks: [67] },
  { name: 'David Nkosi', course: 'JavaScript Foundations', marks: [35, 42, 39, 50] },
  { name: 'Ethan Smith', course: 'Web Development', marks: [70, 73, 68] },
];

studentRecords.forEach((record) => manager.registerStudentFromRecord(record));

const reportFormatter = {
  bootcampName: applicationConfig.bootcampName,
  formatTitle() {
    return `${this.bootcampName} - Final Student Report`;
  },
  formatStudent(student) {
    const marks = student.marks.length > 0 ? student.marks.join(', ') : 'No marks';
    const average = student.average === null ? 'N/A' : student.average.toFixed(2);
    return `${student.id} | ${student.name} | ${student.course} | Marks: ${marks} | Average: ${average} | ${student.status}`;
  },
  formatSummary(totalStudents, studentsProcessed, studentsPassed, studentsFailed) {
    return [
      `Total students: ${totalStudents}`,
      `Students processed: ${studentsProcessed}`,
      `Students passed: ${studentsPassed}`,
      `Students failed: ${studentsFailed}`,
    ].join('\n');
  },
};

const formatStudentLater = reportFormatter.formatStudent.bind(reportFormatter);
const registeredStudents = manager.getAllStudents();

console.log(reportFormatter.formatTitle.call(reportFormatter));
console.log(`Passing mark: ${applicationConfig.getPassingMark()}`);
console.log('Starting asynchronous student processing...');
console.log('This message appears before processing finishes.');

processStudents(
  registeredStudents,
  (student, callback) => manager.processStudent(student.id, callback),
  (error) => {
    if (error) {
      console.error(`Unable to complete the report: ${error.message}`);
      process.exitCode = 1;
      return;
    }

    const reports = manager.getAllStudents();
    const summary = manager.getSummary();
    reports.forEach((student) => console.log(formatStudentLater(student)));
    console.log('');
    console.log(reportFormatter.formatSummary.apply(reportFormatter, [
      summary.totalStudents,
      summary.studentsProcessed,
      summary.studentsPassed,
      summary.studentsFailed,
    ]));
  },
);
