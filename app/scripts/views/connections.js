/*global PreLinked, Backbone, JST*/

PreLinked.Views.ConnectionView = Backbone.View.extend({

  template: JST['app/scripts/templates/connections.hbs'],

  initialize: function(options) {
    this.jobQuery = options.jobQuery;
    this.loginBox = new PreLinked.Views.LoginboxView();
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

    if( this.collection.length ){ //if collection is NOT empty
      this.$el
        .find('#connection-results')
        .html(
          this.collection.map(function(item) {
            return new PreLinked.Views.ConnectionsitemView({
              model: item
            }).render().el;
          })
        );
    } else {
      this.$el
        .find('#connection-results')
        .html("Sorry. I can't find any connection for you.<br>"+
              "How about adding me as your connection...<br><br>");
    }

    return this;
  }

});
