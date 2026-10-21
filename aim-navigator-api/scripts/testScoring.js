import { matchScore } from '../lib/scoring.js';

const student = [15, 38, 20, 10, 9, 12];   // R I A S E C, clearly Investigative

const careers = {
  'Data Scientist (I-A-C)':   [3, 6, 3, 1, 2, 4],
  'Nurse (S-I-C)':            [2, 4, 1, 6, 2, 3],
  'Salesperson (E-S-C)':      [1, 1, 2, 4, 6, 3],
  'Mechanic (R-I-C)':         [6, 4, 1, 1, 2, 3],
};

for (const [name, vec] of Object.entries(careers)) {
  console.log(name.padEnd(28), matchScore(student, vec));
}