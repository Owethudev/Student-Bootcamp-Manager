'use strict';

const DEFAULT_COURSE = 'General Bootcamp';

const applicationConfig = (() => {
  let passingMark = 50;

  return Object.freeze({
    bootcampName: 'Student Bootcamp Manager',
    version: '1.0.0',
    getPassingMark() {
      return passingMark;
    },
    setPassingMark(mark) {
      validateMark(mark, 'Passing mark');
      passingMark = mark;
    },
  });
})();

function validateMark(mark, label = 'Mark') {
  if (typeof mark !== 'number' || !Number.isFinite(mark) || mark < 0 || mark > 100) {
    throw new TypeError(`${label} must be a number between 0 and 100.`);
  }
}

function calculateAverage(marks) {
  if (!Array.isArray(marks)) {
    throw new TypeError('Marks must be provided as an array.');
  }
  if (marks.length === 0) {
    return null;
  }

  marks.forEach((mark) => validateMark(mark));
  return marks.reduce((total, mark) => total + mark, 0) / marks.length;
}

function determineStatus(average, passingMark = applicationConfig.getPassingMark()) {
  validateMark(passingMark, 'Passing mark');
  if (average === null) {
    return 'PENDING';
  }
  validateMark(average, 'Average');
  return average >= passingMark ? 'PASS' : 'FAIL';
}

function* createStudentIdGenerator(prefix = 'SBM') {
  let sequence = 1;

  while (true) {
    yield `${prefix}-${String(sequence).padStart(4, '0')}`;
    sequence += 1;
  }
}

function createProcessingCounter() {
  let processedCount = 0;

  return Object.freeze({
    increment() {
      processedCount += 1;
      return processedCount;
    },
    getCount() {
      return processedCount;
    },
  });
}

function createStudentManager({ passingMark = applicationConfig.getPassingMark(), idPrefix = 'SBM' } = {}) {
  validateMark(passingMark, 'Passing mark');

  const students = [];
  const processedIds = new Set();
  const idGenerator = createStudentIdGenerator(idPrefix);
  const processingCounter = createProcessingCounter();

  function registerStudent(name, course = DEFAULT_COURSE, ...marks) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('Student name must be a non-empty string.');
    }
    if (typeof course !== 'string' || course.trim() === '') {
      throw new TypeError('Course must be a non-empty string.');
    }
    marks.forEach((mark) => validateMark(mark));

    const student = {
      id: idGenerator.next().value,
      name: name.trim(),
      course: course.trim(),
      marks: [...marks],
    };
    students.push(student);
    return { ...student, marks: [...student.marks] };
  }

  function registerStudentFromRecord({ name, course = DEFAULT_COURSE, marks = [] } = {}) {
    if (!Array.isArray(marks)) {
      throw new TypeError('Student marks must be provided as an array.');
    }
    return registerStudent(name, course, ...marks);
  }

  function getStudentReport(student) {
    const average = calculateAverage(student.marks);
    return {
      id: student.id,
      name: student.name,
      course: student.course,
      marks: [...student.marks],
      average,
      status: determineStatus(average, passingMark),
    };
  }

  function getStudent(studentId) {
    const student = students.find((entry) => entry.id === studentId);
    return student ? getStudentReport(student) : null;
  }

  function processStudent(studentId, callback, delay = 10) {
    if (typeof callback !== 'function') {
      throw new TypeError('A callback function is required.');
    }
    if (typeof delay !== 'number' || !Number.isFinite(delay) || delay < 0) {
      throw new TypeError('Processing delay must be a non-negative number.');
    }

    const student = students.find((entry) => entry.id === studentId);
    setTimeout(() => {
      if (!student) {
        callback(new Error(`Student "${studentId}" was not found.`));
        return;
      }
      if (processedIds.has(studentId)) {
        callback(new Error(`Student "${studentId}" has already been processed.`));
        return;
      }

      processedIds.add(studentId);
      processingCounter.increment();
      callback(null, getStudentReport(student));
    }, delay);
  }

  function getAllStudents() {
    return students.map(getStudentReport);
  }

  function getSummary() {
    const processedStudents = students
      .filter((student) => processedIds.has(student.id))
      .map(getStudentReport);

    return {
      totalStudents: students.length,
      studentsProcessed: processingCounter.getCount(),
      studentsPassed: processedStudents.filter((student) => student.status === 'PASS').length,
      studentsFailed: processedStudents.filter((student) => student.status === 'FAIL').length,
    };
  }

  return Object.freeze({
    registerStudent,
    registerStudentFromRecord,
    getStudent,
    getAllStudents,
    processStudent,
    getSummary,
  });
}

function processStudents(students, processor, callback) {
  if (!Array.isArray(students)) {
    throw new TypeError('Students must be provided as an array.');
  }
  if (typeof processor !== 'function' || typeof callback !== 'function') {
    throw new TypeError('Processor and completion callback must be functions.');
  }

  const results = [];
  let currentIndex = 0;

  function processNext(error, result) {
    if (error) {
      callback(error);
      return;
    }
    if (currentIndex > 0) {
      results.push(result);
    }
    if (currentIndex === students.length) {
      callback(null, results);
      return;
    }

    const student = students[currentIndex];
    currentIndex += 1;
    processor(student, processNext);
  }

  processNext();
}

module.exports = {
  DEFAULT_COURSE,
  applicationConfig,
  calculateAverage,
  determineStatus,
  createStudentIdGenerator,
  createProcessingCounter,
  createStudentManager,
  processStudents,
};
