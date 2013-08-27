var testController = module.exports = {};

testController.test = function(req, res){
    console.log('- GET /test - app.get(env)', app.get('env'));

    var fs          = require('fs');
    var path        = require('path');

    /**
    /** TESTING LinkedIn API ---------------------------------------------
    /*/

    // GET COMPANIES
    // var LinkedInApi = require('../models/linkedin_api.js'),
    //     _helper     = require('../controllers/_helper.js');

    // LinkedInApi.searchCompanies(req.session)
    //   .done(
    //     //Resolved: json returned from LinkedIn API
    //     function(json) {
    //       fs.writeFileSync(path.join(__dirname, '../public/_temp_dummy_data/_LinkedIn_Companies.json'), json);
    //       _helper.resolved(req, res, json);
    //     },
    //     //Rejected: error message from LinkedIn API
    //     function(error) {
    //       _helper.rejected(req, res, error);
    //   });

    // // GET /people/search
    // // F first, S second, A groups, O out-of-network(third)
    // req.query = {title: 'software engineer', keywords: 'san francisco, ca',  start: '0', facet:  'network,S,A,O' };
    // // var fileName = "_LinkedIn_People_Search_3rd_Degree_P04.json";
    // var fileName = "_temp_test";
    // linkedin.searchConnections(req, res,
    //       function(json) {
    //         fs.writeFileSync(path.join(__dirname, '../public/_temp_dummy_data/' + fileName), json);
    //       }
    // );

    // GET ALL FIRST DEGREE CONNECTIONS
    // req.query = {start: "500"}; // increment by 500
    // linkedin.searchFirstDegree(req, res,
    //       function(json) {
    //         fs.writeFileSync(path.join(__dirname, '../public/_temp_dummy_data/_LinkedIn_People_My_First_Degrees_P02.json'), json);
    //       }
    // );

    // // GET ME/1st/2nd/3rd degree FULL PROFILE
    // req.params.id = req.session.passport.user.id; // uncomment for your own profile
    // // req.params.id = "TxTQIGBWTJ"; // uncomment for 1st/2nd/3rd degree profiles

    // linkedin.getProfile(req, res,
    //       function(json) {
    //         fs.writeFileSync(path.join(__dirname, '../public/_temp_dummy_data/_LinkedIn_Profile_ME.json'), json);
    //         // fs.writeFileSync(path.join(__dirname, '../public/_temp_dummy_data/_LinkedIn_Profile_Sample_1st_Degree.json'), json);
    //         // fs.writeFileSync(path.join(__dirname, '../public/_temp_dummy_data/_LinkedIn_Profile_Sample_2nd_Degree.json'), json);
    //         // fs.writeFileSync(path.join(__dirname, '../public/_temp_dummy_data/_LinkedIn_Profile_Sample_3rd_Degree.json'), json);
    //       }
    // );

    /**
    /** TESTING Indeed ---------------------------------------------
    /*/

    // GET /jobs/search
    /*
    l=    '12345'
          'San Francisco, CA'
          // zipcode or city, state

    q=
      space = + / AND'd

      with all word:  <word> <word> <word>

      exact phrase:   "software engineer"

      or / at least one of these words:
          ('high school teacher' or 'plumber')
          (plumber or teacher or engineer or accountant)

      job title:  "title:('elementary school teacher')"
                  "title:('software engineer' or 'software developer')"

      salary: $60,000
              $40K-$90K

      company:

      radius=50

      jt=(fulltime+or+parttime)
    */
    // req.query = {q: "title:('architect' or 'software engineer' or 'developer') company:('google' or 'yahoo' or 'salesforce') $90K-$120K ('big data' or 'plumber')", l: "94105"};
    // var fileName = "_Indeed_Results.json";
    // jobs.search(req, res,
    //   function(json){
    //     fs.writeFileSync(path.join(__dirname, '../public/_temp_dummy_data/' + fileName ), json);
    //   }
    // );

  };