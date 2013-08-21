/*global PreLinked, Backbone, JST*/

PreLinked.Views.SearchView = Backbone.View.extend({

  id: 'page-search',
  className: 'page',

  template: JST['app/scripts/templates/search.hbs'],


  initialize: function(options){
    this.jobQuery = options.jobQuery;
    this.searchResultsView  = new PreLinked.Views.SearchResultsView({ collection: new PreLinked.Collections.SearchResultsCollection(), jobQuery: this.jobQuery });
    this.connectionsView    = new PreLinked.Views.ConnectionView({ collection: new PreLinked.Collections.ConnectionsCollection(), jobQuery: this.jobQuery });
    this.searchFilterView = new PreLinked.Views.SearchfilterView({
      model: new PreLinked.Models.SearchfilterModel()
    });
  },

  events: {
    'click #searchFilterButton': 'submitSearch',
    'click .modal-details': 'getModalConnectionDetails',
    'click .jobTitleFilter': 'removeJobTitleFilter',
    'keypress #jobTitleSearchInput': 'dontSearch'
  },

  dontSearch: function(e) {
    var that = this;
      if (e.keyCode == 13) {

        this.jobQuery.jobTitle    = this.$el.find('input[name=job-title]').val();
        this.jobQuery.jobLocation = this.$el.find('input[name=job-location]').val(),
        this.jobQuery.jobKeywords = this.$el.find('input[name=job-keywords]').val();

        that.searchFilterView.model.attributes.jobTitle.push(this.jobQuery.jobTitle);
        that.searchFilterView.model.attributes.jobKeywords.push(this.jobQuery.jobKeywords);
        that.searchFilterView.model.set('jobLocation', this.jobQuery.jobLocation);
        // that.searchFilterView.model.set('jobKeywords', that.jobQuery.jobKeywords);
        console.log('search filter model >>>>>>>>', that.searchFilterView.model);
        that.searchFilterView.render();
      }
  },

  removeJobTitleFilter: function(e) {
    var elToRemove = e.target.className.split(' ')[1];
    var jobTitleArray = this.searchFilterView.model.get('jobTitle');
    var indexToRemove = _.indexOf(jobTitleArray, elToRemove);
    jobTitleArray.splice(indexToRemove, 1);
    this.searchFilterView.model.set('jobTitle', jobTitleArray);
    this.searchFilterView.render();
  },

  submitSearch: function(e) {
    e.preventDefault();
    this.render(true);
    this.searchFilterView.render();
  },

  // loadLinkedInData: function() {
  //   var connectionsElem = $("#connx"),
  //       loadingElem = connectionsElem.find('#connection-results');

  //   loadingElem.show();
  //   IN.API.Connections('me')
  //     .fields(['pictureUrl', 'publicProfileUrl'])
  //     .params({'count': 50})
  //     .result(function(result) {
  //       var profHTML = '';
  //       $.each(result.values, function(i,v) {
  //         if (v.pictureUrl) {
  //           profHTML += '<a href="' + v.publicProfileUrl + '" target="_blank">';
  //           profHTML += '<img class="linkedin-connection-thumb" src="' + v.pictureUrl + '"></a>';
  //         }
  //       });
  //       $("#connx").html(profHTML);
  //     });
  // },

  loadLinkedInData: function() {
    var connectionsElem = $("#connx"),
        loadingElem = connectionsElem.find('#connection-results');

    loadingElem.show();
    IN.API.Connections('me')
      .fields(['pictureUrl', 'publicProfileUrl'])
      .params({'count': 50})
      .result(function(result) {
        // var profHTML = '';
        // $.each(result.values, function(i,v) {
        //   if (v.pictureUrl) {
        //     profHTML += '<a href="' + v.publicProfileUrl + '" target="_blank">';
        //     profHTML += '<img class="linkedin-connection-thumb" src="' + v.pictureUrl + '"></a>';
        //   }
        // });
        // $("#connx").html(profHTML);
      });
  },

  getSearchFilter: function(){
    return this.searchFilterView.render().el;
  },

  getJobResults: function(title, location, keywords) {
    var deferred = $.Deferred();
    var that = this;
    this.searchResultsView.collection
      .fetch( {data: {q: [title, keywords].join(' ') , l: location}} )
      .done(function(){
        that.searchResultsView.jobQuery.title = title; // TODO: THIS IS BEST PRACTICE??????
        deferred.resolve(that.searchResultsView.render().el);
      });
    return deferred.promise();
  },

  getConnections: function(title, company, keywords) {
    var deferred = $.Deferred();
    var that = this;
    this.connectionsView.collection
      .fetch( { data: { title: title, 'company-name': company, keywords: keywords } } )
      .done(function(data){
        // that.connectionsView.jobQuery.title = title;
        deferred.resolve(that.connectionsView.render().el);
      });

    return deferred.promise();
  },

  getModalConnectionDetails: function(events){
    events.preventDefault();
    console.log('getModalConnectionDetails');
    var $target = $(events.target);
    var in_id = $target.closest('a').data('in-id');

    var details = new PreLinked.Models.ModalconnectiondetailsModel({
      id: in_id
    });

    var that = this;
    details.fetch()
      .done(function(data){
        var detailsView = new PreLinked.Views.ModalconnectiondetailsView({
          model: data
        });
        that.$el.append( detailsView.render().el );
        $('#myModal').foundation('reveal', 'open');
      });
  },

  render: function(partial) {
    if (!partial) {
      this.$el.html( this.template() );
    }
    this.$el.find('#search-filters').html(this.getSearchFilter())

    var that = this;
    this.getJobResults(that.jobQuery.jobTitle, that.jobQuery.jobLocation)
      .done(function(element) {
        that.$el.find('#job-results').html(element);
      });

    this.getConnections(that.jobQuery.jobTitle, '', that.jobQuery.jobLocation)
      .done(function(element) {
        that.$el.find('#connections').html(element);
      });

    return this;
  }

});
