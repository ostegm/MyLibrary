'use strict';

function flashMessage(message, timemout=1000) {
  const template = '<div id="flash-message"><span>{{message}}</span></div>';
  const noticeHtml = Mustache.to_html(template, {message});
  const notice = $(noticeHtml);
  notice.css('position', 'absolute');
  notice.css('z-index', 1050);
  $('body').append(notice.hide());
  notice.css('left', ($('body').width() / 2) - (notice.width() / 2)) + 'px';
  notice.css('top', $(window).scrollTop() + 'px');
  notice.fadeIn();
  function removeNotice() { 
    notice.fadeOut(function() {
      notice.remove();
    });
  }
  setTimeout(removeNotice, timemout);
}

function testProtectedEndpoint() {
  $.get('/api/protected', res => {
    console.log('Successfully reached protected endpoint.');
  }).catch(err => {
    console.log('Cant reach protected endpoint.');
  });
}


function setHeaderToken(token) {
  $.ajaxSetup({
    beforeSend: function (xhr)
    {
       xhr.setRequestHeader('Authorization', `Bearer ${token}`);        
    }
  });
}

(function($) {
  // Define our app.
  var app = $.sammy('#app', function() {
    let TOKEN = localStorage.getItem('TOKEN') || null;
    if (TOKEN) {
      console.log('Loaded token from local storage.');
      setHeaderToken(TOKEN);
    }
    this.use('Mustache', 'html');

    this.get('#/', function(context) {
      context.app.swap('');
      context.render('views/home.html').appendTo(context.$element());
    });

    this.get('#/login/', function(context) {
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
    });

    this.get('#/login-required/', function(context) {
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
      flashMessage('You must be logged in to view the dashboard.', 5000);
    });

    this.get('#/dashboard/', function(context) {
      if (!TOKEN) {
        context.redirect('#/login-required/');
      } else {
        context.app.swap('');
        context.render('views/dashboard.html').appendTo(context.$element());
      }     
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
          TOKEN = resData.authToken;
          localStorage.setItem('TOKEN', TOKEN);
          setHeaderToken(TOKEN);
          context.redirect('#/dashboard/');
          })
        .fail(function() {
          flashMessage('Something went wrong, try again?');
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
      // Create a user, and when complete, login and redirect.
      $.ajax('/api/users', reqSettings)
        .done(function() {
          $.ajax('/api/auth/login', reqSettings)
            .done(function(resData) {
              TOKEN = resData.authToken;
              localStorage.setItem('TOKEN', TOKEN);
              setHeaderToken(TOKEN);
              context.redirect('#/dashboard/');
            });
        })
        .fail(function(msg) {
          console.log(msg);
          const error = msg.responseJSON.message;
          flashMessage(`Something went wrong: ${error}`, 20000);
        });
    });

    this.get('#/protected/', function(context) {
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
    });

    this.get('#/logout/', function(context) {
      TOKEN = null;
      localStorage.removeItem('TOKEN');
      setHeaderToken(null);
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
    });

  });

  $(function() {
    app.run('#/');
  });

})(jQuery);