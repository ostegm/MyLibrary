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

  this.post('#/users/', function(context) {
      console.log(this.params);
      const cell = this.params['user-cellphone'].replace('-', '').trim()
      const reqData = {
        email: this.params['user-email'],
        password: this.params['user-password'],
        cellphone: parseInt(cell),
      };
      const reqSettings = {
          data : JSON.stringify(reqData),
          contentType : 'application/json',
          type : 'POST',
      };
      $.ajax('/api/users', reqSettings)
        .done(function(resData) {
          console.log(resData);
          context.app.swap('');
          context.render('views/success.html').appendTo(context.$element());
        })
        .fail(function(msg) {
          // Todo - Make nice error message
          alert(msg.responseText);
      });
    });

  });

  $(function() {
    app.run('#/');
  });

})(jQuery);