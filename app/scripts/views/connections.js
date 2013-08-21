/*global PreLinked, Backbone, JST*/

PreLinked.Views.ConnectionView = Backbone.View.extend({

  template: JST['app/scripts/templates/connections.hbs'],

  initialize: function(options) {
    this.jobQuery = options.jobQuery;
    this.loginBox = new PreLinked.Views.LoginboxView();
  },

  testModal: function(){
    var Modal = (new PreLinked.Views.PmodalView()).pmodal;
    var modal = new Modal({
      title: 'Test title',
      content: "Test content"
    });
    modal.open();
  },

  render: function(){
    console.log('connection.js -render-');
    console.log('CONNECTION RESULTS ', this.collection.length);

    this.$el.html(this.template({
      number_of_connections: this.collection.length
    }));

    this.$el
      .find('#login-box')
      .html(this.loginBox.render().el);

    if( !this.collection.length ){ //if collection is NOT empty
      this.$el.find('#connection-results').empty();
      this.$el.find('#connection-results').append(
        this.collection.map(function(item) {
          return new PreLinked.Views.ConnectionsitemView({
            model: item
          }).render().el;
        })
      );
    }

    return this;
  }

});
