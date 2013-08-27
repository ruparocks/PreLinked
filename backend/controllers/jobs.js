var IndeedApi = require('../models/indeed_api.js');
var LinkedInApi = require('../models/linkedin_api.js');
var fs        = require('fs');
var path      = require('path');
var _helper   = require('./_helper.js');
var personsController = require('./persons.js');
var jobsController = require('../controllers/jobs_controller.js');
var natural = require('natural');

var jobs = module.exports = {};

var _grabOnePage = function(req_query){
  var deferred = Q.defer();
  IndeedApi
    .search(req_query, {start: 0})
    .then(function(data){
      if(typeof data === 'string'){
        data = JSON.parse(data);
      }
      deferred.resolve(data);
    });
  return deferred.promise;
};

var _grabMultiplePages = function(req_query) {
  var deferred = Q.defer();
  var promises = [];
  for(var i = 0; i < 100; i+=25) {
    var output = IndeedApi.search(req_query, {start: i});
    promises.push(output);
  }

  Q.all(promises)
    .done(
      // Resolved
      function(data){
        data = _(data).map(function(item){
          return JSON.parse(item);
        });
        data = _(data).flatten(true); //only flatten the first level
        deferred.resolve(JSON.stringify(data));
      },
      // Rejected
      function(error){
        deferred.reject(error);
      }
    );

  return deferred.promise;
};


// GET /jobs/search
jobs.search = function(req, res, testCallback){
  console.log('- GET /jobs/search - Controller -> IndeedApi.searchConnections >> ');

  req.query.useragent = req.headers['user-agent'];
  req.query.userip = _helper.getClientIp(req);
  /*
  /* Indeed API with Pagination ------------------------
  */

  _grabMultiplePages(req.query)
    .done(
      // Resolved
      function(json) {
        console.log('Paginated JSON Data length',json.length);
        _helper.resolved(req, res, json);
      },
      // Rejected:
      function(error) {
        _helper.rejected(req, res, error);
    });

  // console.log('job results ************', jobResults);

  /*
  /* Indeed API Single Call ------------------------
  */

  // IndeedApi.search(req.query, {}, testCallback)
  //   .done(
  //     //Resolved: json returned from Indeed API
  //     function(json) {
  //       console.log('Length >>>>>>',json.length);
  //       _helper.resolved(req, res, json);
  //     },
  //     //Rejected: error message from Indeed API
  //     function(error) {
  //       _helper.rejected(req, res, error);
  //   });


  /*
  /* Dummy Data ------------------------
  */

  // var fileContent = fs.readFileSync(path.join(__dirname, '../public/_temp_dummy_data/dummy_indeed_search_results.json'), 'utf8');
  // _helper.resolved(req, res, fileContent);

};

var _saveInSearch = function(inSearch, myId){
  if(typeof inSearch === 'string'){
    inSearch = JSON.parse(inSearch);
    //API returns a string
  }
  if(inSearch && inSearch.people && inSearch.people.values){
    _(inSearch.people.values).each(function(data){
      personsController._put(data, myId)
        .then(function(){
          console.log('Data saved successfully.');
        });
      // console.log(Object.keys(data) + '\n\n');
      // apiStandardProfileRequest,distance,firstName,headline,id,industry,
      // lastName,location,numConnections,numConnectionsCapped,pictureUrl,positions,
      // publicProfileUrl,relationToViewer,siteStandardProfileRequest,summary
    });
  }
//apiStandardProfileRequest

};

var _saveFirstDegree = function(inFirstDegree, myId){
  if(typeof inFirstDegree === 'string'){
    inFirstDegree = JSON.parse(inFirstDegree);
    //API returns a string
  }
  if(inFirstDegree && inFirstDegree.values){
    _(inFirstDegree.values).each(function(data){
      personsController._put(data, myId)
        .then(function(){
          console.log('Data saved successfully.');
        });
    });
  }
};

var _saveIndeedJobs = function(indeedSearch){
  if(typeof indeedSearch === 'string'){
    indeedSearch = JSON.parse(indeedSearch);
    //API might return string
  }
  if(indeedSearch.length){
    _(indeedSearch).each(function(data){
      jobsController._post(data)
        .then(function(job){
          console.log('Indeed job saved successfully: ', job);
        });
    });
  }

};

//testing function
jobs.testScore = function(req, res){
  _getJobsAndConnections(req, res);
};

var _getJobsAndConnections = function(req, res){
  var promises = [];

  //first, indeed jobs
  var indeed_query_obj =  { jobTitle: [ 'software engineer' ],
                            jobLocation: 'Mountain View, CA',
                            distance: '25',
                            minSalary: 'None',
                            maxSalary: 'None',
                            useragent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.57 Safari/537.36',
                            userip: '127.0.0.1'
                          };
  promises.push( _grabMultiplePages(indeed_query_obj) );

  //second, linkedin first degrees
  //First 500 for now
  promises.push( LinkedInApi.searchFirstDegree(req.session) );

  //third, linkedin second degrees
  var linkedin_second_degree_query_obj = {
    title   : 'software engineer',
    keywords: 'google san francisco, ca',
    start   : '0',
    facet   : 'network,S'
  };
  promises.push( LinkedInApi.searchConnections(req.session, linkedin_second_degree_query_obj) );

  //fourth, linkedin third degrees
  var linkedin_third_degree_query_obj = {
    title   : 'software engineer',
    keywords: 'google san francisco, ca',
    start   : '0',
    facet   : 'network,A,O'
  };
  promises.push( LinkedInApi.searchConnections(req.session, linkedin_third_degree_query_obj) );

  //input
  //100 indeed jobs
  //500 1st degree
  //25 2nd degree
  //25 3rd degree

  Q.all(promises)
    .then(function(data){
      data = _(data).map(function(value, index){
        console.log('data ' + index, value.length, value.substring(0,200) + '\n');
        return JSON.parse(value);
      });
      //convert data from string to objects

      if(data.length === 4){
        //first element is indeed jobs
        //the last three elements are linkedin connections
        var jobs = data[0];
        if(data[1].values && data[1].values.length){
          var connections = data[1].values.concat( data[2], data[3] );
        }
        console.log('jobs: \n', jobs.length);
        console.log('connections: \n', connections.length);
      }
    });

};

//helper method to save promises to db
var _savePromises = function(req, res, promises){
  Q.all(promises)
    // .spread(function(indeedSearch, inSearch, inFirstDegree){
    .spread(function(indeedSearch, inFirstDegree){
      console.log('IndeedApi search data: \n', indeedSearch);
      // _saveIndeedJobs(indeedSearch);

      // console.log('LinkedInApi search data: \n');
      // _saveInSearch(inSearch, req.session.passport.user.id);

      console.log('LinkedInApi first degree data: \n', inFirstDegree);
      // _saveFirstDegree(inFirstDegree, req.session.passport.user.id);

      _helper.resolved(req, res, indeedSearch);
      res.end('end');
    });
};

var _getScore = function(job, connections){
  var employer = job.company; // Apple
  // console.log('employer from indeed\n', employer);

  var friends = [];
  _(connections).each(function(item){
    var output = {};
    output.id = item.id;
    if(item.positions && item.positions.values && item.positions.values.length){
      output.positions = _(item.positions.values).map( function(item){
        return item.company && item.company.name;
      } );
    }
    var stringDistances = _(output.positions).map(function(pos){
      return natural.JaroWinklerDistance(employer, pos);
    });
    output.stringDistance = _(stringDistances).max();
    friends.push(output);
  });

  friends = _(friends).sortBy(function(item){
    return -1 * item.stringDistance;
  });
  // console.log('best match from linkedin connections\n', friends[0] );
  // console.log('Best match score\n', friends[0].stringDistance );
  return friends[0].stringDistance;
};

jobs.searchSorted = function(req, res){
  console.log('-controller-jobs.searchSorted()');
  req.query.q = req.query.q || 'Software Engineer';
  req.query.keywords = req.query.keywords || 'Software Engineer';
  var totalJobs = _grabOnePage(req.query);


  var connectionsFileContent = fs.readFileSync(path.join(__dirname, '../public/_temp_dummy_data/dummy_linkedin_connections_search_results.json'), 'utf8');
  var connections = JSON.parse(connectionsFileContent);

  var sortJobs = function(inputJobs, inputConnections){
    _(inputJobs).each(function(inputJob){
      inputJob.pScore = _getScore(inputJob, inputConnections);
      inputJob.pConnections = _(inputConnections).filter(function(conn){
        return (Math.random() < 1/4 ? true : false);
      });
      //todo
      //fix dummy data
    });
    return inputJobs;
  };

  totalJobs.then(function(jobResults){
    // console.log('jobResults -->', jobResults.length);
    var jobsSorted = sortJobs(jobResults, connections);
    _helper.resolved(req, res, jobsSorted);
  });

};