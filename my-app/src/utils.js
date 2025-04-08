export const API_ROOT_TESTING = "http://127.0.0.1:8888";

export function isRunningLocally() {
  const localHostNames = ["localhost", "127.0.0.1"];
  return localHostNames.includes(window.location.hostname);
}

// constant to track where the user is in the app's workflow
export const STATUS = {
  START: 'start', // landing page
  GAVE_INFO: 'gave info', // user has given ranking and address, and can now see scenario info
  SUBMITTED_INIT_FEEDBACK: 'submitted init feedback', // user submitted initial feedback, and will be shown perspective-getting page
  SUBMITTED_FINAL_FEEDBACK: 'submitted final feedback' // user confirmed feedback after being shown perspective-getting page
}

// helper function to clean the decimal values
export const cleanValue = (value) => {
  // convert decimal to percent and round to nearest whole number
  return Math.round(value * 100);
}

// converts travel time from seconds to minutes
export const secToMin = (sec) => {
  return Math.round(sec / 60 * 10) / 10
}

// calculates % of students who experience a type of change (increase or decrease) in travel time
// out of everyone who experience a change or not
export const calcPercent = (change, studentEffects) => {
  if(change == 'decrease') {
      return Math.round(studentEffects.num_students_decrease / (studentEffects.num_students_decrease + studentEffects.num_students_increase + studentEffects.num_students_no_change) * 1000) / 10
  } else if(change == 'increase') {
      return Math.round(studentEffects.num_students_increase / (studentEffects.num_students_decrease + studentEffects.num_students_increase + studentEffects.num_students_no_change) * 1000) / 10
  }
}

// helper function to calculate the number of schools that are within target enrollment (<= 130% utilization)
export const getNumSchoolsWithinTarget = (inputData) => {
  // variable to keep track of the number of schools within target enrollment
  let numSchools = 0;
  // iterate through the data
  for (let i = 0; i < inputData.length; i++) {
    // if the utilization is less than or equal to 100%, increment the number of schools
    if (inputData[i].num_students / inputData[i].student_capacity <= 1) {
      numSchools++;
    }
  }
  // return the number of schools
  return numSchools;
}

// helper function to get the number of families with split and intact feeder patterns given the feeder data
export const getNumFamilies = (data) => {
  let numSplit = 0;
  let numIntact = 0;
  // iterate through links field in data
  for (let i = 0; i < data.links.length; i++) {
      // if the link is a split link, increment numSplit
      if (data.links[i].is_split) {
          // add the value field to numSplit
          numSplit += data.links[i].value;
      } else {
          // else increment numIntact
          numIntact += data.links[i].value;
      }
  }
  // return the values
  return [numSplit, numIntact];
}

export const calcMaxEnrollment = (num) => {
  return Math.round(num * 1.3)
}