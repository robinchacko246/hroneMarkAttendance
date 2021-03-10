"use strict";
const { pool } = require("../models/db.js");
const Axios    = require("axios");

/**************************************here fetch service is called from cron ****************************************/
//there are mainly 3 services calling inside fetch service
        //1)getEntireUserList 
        //2)mappingEmployeeWithEmailAndHroneApi
        //3)apiHrOneMarkAttendance

 //1) getEntireUserList 
 
     //getEntireUserList is used to fetch all clockyfy updated users ,Each clockyfy api call maximum array size is 200 
     //if total entries more than 200 we need to again call clockyfy api with page number 2  
 //2)mappingEmployeeWithEmailAndHroneApi
     // mappingEmployeeWithEmailAndHroneApi service is  mapping between employess table in our db and clockyfy users 
     //mail id to fetch emp_id   because hrone api accept emp_id not email id of users.

 //3)apiHrOneMarkAttendance
 // api to Hrone for updating timings and attendance    
/**************************************here fetch service is called from cron ****************************************/



module.exports.fetch = async () => {
  
  try {
    let test = [],multipleTask = [],flag = 1;
     
      
    var uniqTimeentries = [],tempArray = [];
      
    var body = {
      "dateRangeStart": getYesterdaysDate()+"T00:00:00.000",
      "dateRangeEnd": getYesterdaysDate()+"T23:59:59.000",
      "detailedFilter": {
        "page": 1,
        "pageSize": 200
      },
      "users": {
        "status": "ALL"
      }
    };
  
   
    
    const entireList = await getEntireUserList(body); // get all clockyfy updated users here

    entireList.reverse(); // we get entire clockyfy list order of dateTime Desc so we need to reorder as ASC       

    
    entireList.forEach((value) => {
      test.push(value.userEmail);
    });
    function duplicate(arr) {
      return arr.filter((item, index) => arr.indexOf(item) !== index);
    }

    duplicate(test).forEach((value) => {
      multipleTask.push(value);
    });

    for (var i = 0; i < entireList.length; i++) {
      flag = 1;
      for (let k = 0; k < multipleTask.length; k++) {
        if (entireList[i].userEmail == multipleTask[k]) {
          flag = 0;
        }
      }

      if (flag == 1) {
        //find uniq task entries
        uniqTimeentries.push({                          //here we geting unique task entries users list
          userEmail: entireList[i].userEmail,
          userId: entireList[i].userId,
          startTime: entireList[i].timeInterval.start,
          endTime: entireList[i].timeInterval.end,
        });
      }
    }

   

    for (let x = 0; x < multipleTask.length; x++) {
      tempArray = [];
      for (let y = 0; y < entireList.length; y++) {
        if (entireList[y].userEmail == multipleTask[x]) {
          tempArray.push({
            userEmail: entireList[y].userEmail,
            userId: entireList[y].userId,
            startTime: entireList[y].timeInterval.start,
            endTime: entireList[y].timeInterval.end,
            duration: entireList[y].timeInterval.duration,
          });
        }
      }
      
      //here caluclate end datetime of multile task users
      let dt = new Date(tempArray[0].startTime);
      let finalDuration = 0;
      for (let l = 0; l < tempArray.length; l++) {
        finalDuration = finalDuration + tempArray[l].duration;
      }

      let endTimeCalculated = dt.setSeconds(dt.getSeconds() + finalDuration);

      

      uniqTimeentries.push({  //here append multiple task entries to uniq task entries array
        
        userEmail: tempArray[0].userEmail,
        userId: tempArray[0].userId,
        startTime: tempArray[0].startTime,
        endTime: new Date(endTimeCalculated).toISOString(),
      });
    }

    // console.log("uniq task users", uniqTimeentries);

   await  mappingEmployeeWithEmailAndHroneApi(uniqTimeentries);

   return {
    statusCode: 200,
    message: "successfully Updated Hr-One",
   
   
  };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 400,
      message: "Error Occured!",
     
     
    };
  }
};

async function mappingEmployeeWithEmailAndHroneApi(uniqTimeentries) {
  let userEmailArray = [];

  uniqTimeentries.forEach((element) => {
    userEmailArray.push(element.userEmail);
  });

  let res = await pool.query(`SELECT email_id,emp_id FROM employees`);

  res.forEach((element) => {
    for (let index = 0; index < uniqTimeentries.length; index++) {
      if (element.email_id == uniqTimeentries[index].userEmail) {
        uniqTimeentries[index].emp_id = element.emp_id;
      }
    }
  });

  apiHrOneMarkAttendance(uniqTimeentries); //api to Hrone for updating timings and attendance    
}

async function apiHrOneMarkAttendance(uniqTimeentries) {
  let newArray = [];
  uniqTimeentries.forEach((element) => {
    if(element.emp_id)
    {
      newArray.push({
        fk_emp_code: element.emp_id,
        trndate: element.startTime,
      });
      newArray.push({
        fk_emp_code: element.emp_id,
        trndate: element.endTime,
      });
    }
    
  });
  
  
    await MarkAttendance(newArray)
  
  //console.log("new Array", newArray);

  
}

const getUsers = async function (body, pageNo = 1) {
  body.detailedFilter.page = pageNo; //update the page NO

  /***************************************clockyfy api to fetch time sheet updated user details*************************** */
  var apiResults = await Axios({    
    method: "post",
    url:
      "https://reports.api.clockify.me/v1/workspaces/5d44093b5ff7bb5e9a9d10b6/reports/detailed",
    data: body,
    headers: { "X-Api-Key": "X5Y4ONREYBx+q4qH" },
  });
  /***************************************end clockyfy api to fetch time sheet updated user details************************ */

  return apiResults.data; 
};

const getEntireUserList = async function (body, pageNo = 1) {


  var { timeentries, totals } = await getUsers(body, pageNo); //returing the data storing  var line no (24)
  console.log("Retreiving data from API for page : " + pageNo);
  // here we need to put the logic for checking next page is available or not //

  let entriesCount = totals[0].entriesCount; 
  
 
  let expectingResult = pageNo * 200; // 
  if (expectingResult < entriesCount) {  //if total entries more than 200 we need to again call clockyfy api with page number 2  
    return (timeentries = [
      ...timeentries, //marging the Array using spread operator
      ...(await getEntireUserList(body, pageNo + 1)),
    ]);
  } else {
    return timeentries;
  }
};

function getYesterdaysDate() {
  let newDate,newMonth;
  var date = new Date();
  date.setDate(date.getDate()-1);
  newDate=date.getDate()<10 ? '0'+date.getDate() :date.getDate()
  newMonth=(date.getMonth()+1)<10 ? '0'+(date.getMonth()+1) :(date.getMonth()+1)
  return date.getFullYear()+'-'+newMonth+'-'+newDate;
}

async function MarkAttendance(newArray){



  var newArray1 = newArray.splice(0,1000);
  Axios.post(
    "https://hronemanagedapi.hrone.cloud/production/api/external/timeOffice/markAttendance",

    {
      dataTable: newArray1,
    },
    {
      headers: {
        apiKey: "ct5Gs7YtGLxQJe5wIc2SB9wJg732aASt4XQhzblibtc",
        userId: "EM11192015",
        "Ocp-Apim-Subscription-Key": "c65308064f1048049d905842cbc57af3",
        domainCode: "emvigo",
      },
    }
  )
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
    if(newArray.length>0)
    {

      //var newArray2 = newArray.splice(0,1000);
      await MarkAttendance(newArray)

    }
    

}