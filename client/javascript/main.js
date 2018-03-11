'use strict';
const NEXTBUSURL = 'http://webservices.nextbus.com/service/publicXMLFeed?';
const x2js = new X2JS();

function parseJwt (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};


function flashMessage(message, timemout=1000) {
  const template = '<div id="flash-message"><span>{{message}}</span></div>';
  const notice = $(Mustache.to_html(template, {message}));
  notice.css('position', 'absolute');
  notice.css('z-index', 1050);
  $('#app').prepend(notice.hide());
  notice.css('left', ($('body').width() / 2) - (notice.width() / 2)) + 'px';
  notice.css('top', $(window).scrollTop() + 30 + 'px');
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

function renderNavLinks(loggedIn=true) {
  let links;
  if (loggedIn) {
    links = [
      {text: 'My Library', url: '#/dashboard/'},
      {text: 'Add a Book', url: '#/add-book/'},
      {text: 'Sign Out', url: '#/logout/'},
    ];
  } else {
    links = [
      {text: 'Home', url: '#/'},
      {text: 'Sign Up', url: '#/signup/'},
      {text: 'Log In', url: '#/login/'},
    ];
  }
  $('.nav-links').empty()
  const navLinkHtml =  links.map(item => {
    return `<li><a href="${item.url}">${item.text}</a></li>`
  })
  $('.nav-links').append(navLinkHtml);
}

(function($) {
  // Define our app.
  var app = $.sammy('#app', function() {
    let TOKEN = localStorage.getItem('TOKEN') || null;
    let USERID;
    let BOOKS = []; //Refilled each time dashboard loads.
    if (TOKEN) {
      console.log('Loaded token from local storage.');
      USERID = parseJwt(TOKEN) || null;
      setHeaderToken(TOKEN);
    }
    this.use('Mustache', 'html');

    this.get('#/', function(context) {
      context.app.swap('');
      context.render('views/home.html').appendTo(context.$element());
      context.render('views/signup.html').appendTo(context.$element());
      renderNavLinks(false);
    });

    this.get('#/login/', function(context) {
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
      renderNavLinks(false);
    });

    this.get('#/login-required/', function(context) {
      context.app.swap('');
      context.render('views/login.html').appendTo(context.$element());
      renderNavLinks(false);
      flashMessage('You must be logged in to view that page.', 5000);
    });

    this.get('#/dashboard/', function(context) {
      if (!TOKEN) {
        context.redirect('#/login-required/');
        return
      }
      context.app.swap('');
      context.render('views/dashboard.html').appendTo(context.$element());
      renderNavLinks(true);      
      let rendered;
      BOOKS = []
      $.get('/api/library')
        .done(function(books) {
          $.each(books, async function(i, book) {
            BOOKS.push(book);
            book.editUrl = `#/edit/${book.id}`
            rendered = await context.render('views/book.html', book)
            $('tbody').append(rendered);
          });
        })
        .fail( function() {
          flashMessage('Make sure you have at least one book in your library.');
        })
    });

   this.get('#/add-book/', function(context) {
      if (!TOKEN) {
        context.redirect('#/login-required/');
        return
      }     
      context.app.swap('');
      context.render('views/add-book.html').appendTo(context.$element());
      renderNavLinks(true);      
   });

    this.post('#/add-book/', function(context) {
      if (!USERID) {
        USERID = parseJwt(TOKEN);
      }
      const reqData = {
        author: this.params['author'],
        title: this.params['title'],
        comments: this.params['comments'],
        dateFinished: this.params['date'],
        userId: USERID,
      };
      const reqSettings = {
          data: JSON.stringify(reqData),
          contentType: 'application/json',
          type: 'POST',
        };
      $.ajax('/api/library', reqSettings)
        .done(function(resData) {
          context.redirect('#/dashboard/');
          })
        .fail(function(msg) {
          console.log(msg);
          const error = msg.responseJSON.message;
          flashMessage(`Something went wrong: ${error}`, 20000);
        });
    });

    this.get('#/edit/:bookId', async function(context) {
      if (!TOKEN) {
        context.redirect('#/login-required/');
        return
      }
      let bookId = this.params['bookId']
      BOOKS = await $.get('/api/library')
      let book = BOOKS.find(b => {return b.id === bookId})
      console.log(bookId, book)
      context.app.swap('');
      context.render('views/edit-book.html', book)
        .appendTo(context.$element());
    });

    this.post('#/edit/:bookId', function(context) {
     const bookId = this.params['bookId']
     const reqData = {
        id: bookId,
        title: this.params['title'],
        author: this.params['author'],
        dateFinished: this.params['dateFinished'],
        comments: this.params['comments'],
      };
      const reqSettings = {
          data: JSON.stringify(reqData),
          contentType: 'application/json',
          type: 'PUT',
        };
      $.ajax(`/api/library/${bookId}`, reqSettings)
        .done(function(resData) {
          context.redirect('#/dashboard/');
          })
        .fail(function() {
          flashMessage('Something went wrong, try again?');
        });
    })

    this.get('#/delete/:bookId', function(context) {
     const bookId = this.params['bookId']
      $.ajax(`/api/library/${bookId}`, {type: 'DELETE'})
        .done(function(resData) {
          context.redirect('#/dashboard/');
          flashMessage('Book Successfully removed from library.');
          })
        .fail(function() {
          flashMessage('Something went wrong, try again?');
        });
    })

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
      renderNavLinks(false);      
    });

    this.post('#/signup/', function(context) {
      const reqData = {
        email: this.params['user-email'],
        password: this.params['user-password'],
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
              USERID = parseJwt(TOKEN);
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

    this.get('#/logout/', function(context) {
      TOKEN = null;
      localStorage.removeItem('TOKEN');
      setHeaderToken(null);
      context.redirect('#/login/');
    });

  
  });

  $(function() {
    app.run('#/');
  });

})(jQuery);