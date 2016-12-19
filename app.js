'use strict';

var authenticationEndpoint = 'https://0ez31ged8j.execute-api.us-east-1.amazonaws.com/dev';
var contentApiEndpoint = 'https://6cr1cnmxc1.execute-api.us-east-1.amazonaws.com/dev';
function testToken() {
  var authorizationToken = localStorage.getItem('authorization_token');
  if (authorizationToken) {
    $('#test-result').html('Loading...');

    // set token to Authorization header
    $.ajax({
        method: 'GET',
        url: contentApiEndpoint + '/test-token',
        headers: {
          Authorization: authorizationToken
        }
      })
      .done(function (data) {
        $('#test-result').html(JSON.stringify(data));
      })
      .fail(function (error) {
        if($('#auto-refresh').prop('checked')) {
          $('#test-result').html('Refreshing token...');
          refreshToken();
        } else {
          $('#test-result').html('Unauthorized');
        }
      });
  } else {
    $('#test-result').html('Unauthorized');
  }
}

function refreshToken() {
  $('#test-result').html('Loading...');

  // refresh token
  $.ajax({
      method: 'GET',
      url: authenticationEndpoint + '/authentication/refresh/' + localStorage.getItem('refresh_token')
    })
    .done(function (data) {
      if (data.errorMessage) {
        $('#test-result').html(data.errorMessage);
      } else {
        saveResponse(data.authorization_token, data.refresh_token);
        testToken();
      }
    })
    .fail(function (error) {
      $('#test-result').html('Unauthorized');
    });
}

function saveResponse(authorization_token, refresh_token) {

  // Save token to local storage for later use
  if(authorization_token) {
    localStorage.setItem('authorization_token', authorization_token);
  }
  if(refresh_token) {
    localStorage.setItem('refresh_token', refresh_token);
  }

  $('#token').html('authorization_token:'+localStorage.getItem('authorization_token')+'<hr>refresh_token:'+localStorage.getItem('refresh_token'));
}

function getPathFromUrl(url) {
  return url.split(/[?#]/)[0];
}

function getQueryParams(qs) {
  qs = qs.split('+').join(' ');
  var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }
  return params;
}

$(function () {
  $('.providers button').on('click', function (event) {
    var provider = $(event.currentTarget).attr('id');
    $('#token').html('Loading...');
    $('#test-result').html('Loading...');
    window.location.href = authenticationEndpoint + '/authentication/signin/' + provider;
  });

  $('#logout').on('click', function(event) {
    localStorage.removeItem('authorization_token');
    localStorage.removeItem('refresh_token');
    window.location.href = getPathFromUrl(window.location.href);
  });

  var query = getQueryParams(document.location.search);
  if (query.error){
    $('#token').html(query.error);
    localStorage.removeItem('authorization_token');
    localStorage.removeItem('refresh_token');
  } else {
    var aToken = query.authorization_token || '';
    var rToken = query.refresh_token || '';
    saveResponse(aToken, rToken);
    window.history.replaceState({authorization_token: ''}, 'serverless-authentication-gh-pages', '/serverless-authentication-gh-pages');

    // trigger test token
    testToken();
  }

  $('.testers #test').on('click', testToken);
  $('.testers #refresh').on('click', refreshToken);
});
