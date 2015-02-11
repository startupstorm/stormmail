$(function() {
  $.get('/ajax/mail/index').done(function(result) {
    $('#J_content').html(result);
  });
  var $sideBar = $('.bs-docs-sidebar')
  var $mailTab = $('nav a#mailTab')

});
