var assert = require("assert"); // node.js core module

// force the test environment to 'test'
// process.env.NODE_ENV = 'test';

// use zombie.js as headless browser
var Browser = require('zombie');
var http = require('http');
var routes = require('../../routes');

// get the application server module
var app = require('../../app');
 
describe('signup page', function() {
  before(function() {
    routes(app);
    this.server = app.listen(5000);
    // initialize the browser using the same port as the test application
    this.browser = new Browser({ site: 'http://127.0.0.1:5000' });
  });
 
  // load the signup page
  before(function(done) {
    this.browser.visit('/signup', done);
  });

  it('should show a signup form', function(){
  	assert.ok(this.browser.success);
  	assert.equal(this.browser.text('li > h1'), 'Create Your Account');
    assert.equal(this.browser.text('fieldset.personal legend'), 'Personal');
    assert.equal(this.browser.text('fieldset.contact legend'), 'Contact');
    assert.equal(this.browser.text('button'), 'Next Step');
  });
  it('should refuse empty submissions', function(done){
    var browser = this.browser;
    browser.pressButton('#nextstep', function(error) {
      if (error) return done(error);

      //Test that we are still on the same page
      assert.equal(browser.text('h1'), 'Create Your Account');
      assert.equal(browser.text('fieldset.personal legend'), 'Personal');
      assert.equal(browser.text('fieldset.contact legend'), 'Contact');
      assert.equal(browser.text('#nextstep'), 'Next Step');

      //Test that form validation is working 
      error_msgs = browser.queryAll("label.error");
      error_msgs.forEach(function(msg){
        assert.equal(msg, 'This field is required.');
      });

      done();
    });
  });

  it('should refuse partial submissions', function(done){
    var browser = this.browser;

    browser.
      fill("curr_email", "polydaic@gmail.com").
      fill("username", "david").
      fill("pass", "aeo");

    browser.pressButton('#nextstep', function(error) {
      if (error) return done(error);

      //Test that we are still on the same page
      assert.equal(browser.text('h1'), 'Create Your Account');
      assert.equal(browser.text('fieldset.personal legend'), 'Personal');
      assert.equal(browser.text('fieldset.contact legend'), 'Contact');
      assert.equal(browser.text('#nextstep'), 'Next Step');

      //Test that form validation is working 
      error_msgs = browser.queryAll("label.error");
      error_msgs.forEach(function(msg){
        assert.equal(msg, 'This field is required.');
      });

      done();
    });
  });

  it('should refuse invalid submissions', function(done){
    var browser = this.browser;

    browser.
      fill("curr_email", "polydaicgmail.com").
      fill("username", "david^&$*%^").
      fill("pass", "aeo").
      fill("pass_confirm", "aoe").
      pressButton('#nextstep', function(error){
        if(error) return done(error);

        //Test that we are still on the same page
        assert.equal(browser.text('h1'), 'Create Your Account');
        assert.equal(browser.text('fieldset.personal legend'), 'Personal');
        assert.equal(browser.text('fieldset.contact legend'), 'Contact');
        assert.equal(browser.text('#nextstep'), 'Next Step');

        //Test that form validation is working 
        error_msgs = browser.queryAll("label.error");
        error_msgs.forEach(function(msg){
          if(msg.id == 'email'){
            assert.equal(msg, 'Please enter a valid email address');
          }else if (msg.id == '')
          assert.equal(msg, 'This field is required.');
        });

      })
  });
  // ...
 
  after(function(done) {
    this.server.close(done);
  });
});