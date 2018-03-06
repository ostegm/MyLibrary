'use strict';

const BA__ = {};

BA__.routes = {
  '': 'views/home.html',
  '#': 'views/home.html',
  '#login': 'views/login.html'
};

BA__.loadRoute = function(path) {
  const route = path || window.location.hash;
  $('#app').load(this.routes[route], function() {
    BA__.main();
  });
};

BA__.watchInternalRoutes = function() {
  $('.internal-link').on('click', e => {
      console.log(e.target.hash);
      BA__.loadRoute(e.target.hash);
      e.preventDefault();
    });
}

BA__.main =  function() {
  BA__.loadRoute();
};

$(() => BA__.main());
