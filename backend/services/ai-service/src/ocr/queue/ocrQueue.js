// Simple in-memory queue for OCR jobs
const queue = [];

function addJob(job) {
  queue.push(job);
}

function getNextJob() {
  return queue.shift();
}

function getQueueLength() {
  return queue.length;
}

function getAllJobs() {
  return [...queue];
}

module.exports = { addJob, getNextJob, getQueueLength, getAllJobs };
