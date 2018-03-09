'use strict';

const TOKEN = localStorage.getItem('TOKEN');
// console.log(`Token: ${TOKEN}`)

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

    this.get('#/dashboard/', function(context) {
      context.app.swap('');
      context.render('views/login-success.html').appendTo(context.$element());
    });

    this.post('#/login/', function(context) {
      const reqData = {
        email: this.params['user-email'],
        password: this.params['user-password'],
      };
      const reqSettings = {
          data: JSON.stringify(reqData),
          contentType: 'application/json',
          type: 'POST',
        };
      $.ajax('/api/auth/login', reqSettings)
        .done(function(resData) {
          localStorage.setItem('TOKEN', resData.authToken);
          // TODO - Add user email to template.
          // TODO - Modify nav to reflect logged in user.
          // TODO - Add global header https://api.jquery.com/jquery.ajaxsetup/
          context.redirect('#/dashboard/');
        })
        .fail(function(msg) {
          // Todo - Make nice error message
          alert(msg.responseText);
        });
    });

    this.get('#/signup/', function(context) {
      context.app.swap('');
      context.render('views/signup.html').appendTo(context.$element());
    });

    this.post('#/signup/', function(context) {
      const cell = this.params['user-cellphone'].replace('-', '').trim();
      const reqData = {
        email: this.params['user-email'],
        password: this.params['user-password'],
        cellphone: parseInt(cell),
      };
      const reqSettings = {
          data: JSON.stringify(reqData),
          contentType: 'application/json',
          type: 'POST',
        };
      $.ajax('/api/users', reqSettings)
        .done(function(resData) {
          console.log(resData);
          context.app.swap('');
          // TODO - Add user email to template.
          context.render('views/signup-success.html')
            .appendTo(context.$element());
        })
        .fail(function(msg) {
          // Todo - Make nice error message
          alert(msg.responseText);
        });
    });

    this.get('#/protected/', function(context) {
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
    });

    this.get('#/logout/', function(context) {
      localStorage.removeItem('TOKEN')
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
    });

  });

  $(function() {
    app.run('#/');
  });

})(jQuery);