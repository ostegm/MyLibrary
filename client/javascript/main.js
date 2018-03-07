'use strict';

(function($) {
      
  var app = $.sammy('#app', function() {

   this.get('#/', function(context) {
      context.app.swap('');
      context.render('views/home.html').appendTo(context.$element());
    });
   
   this.get('#/login/', function(context) {
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
    });

  this.get('#/signup/', function(context) {
      context.app.swap('');
      context.render('views/signup.html').appendTo(context.$element());
    });

  });

  $(function() {
    app.run('#/');
  });

})(jQuery);