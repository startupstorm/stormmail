//Custom implementation of indexOf for IE Support
var _indexOf = function(needle) {
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle);
};

$(function() {
  'use strict';

  var inboxTpl = $('#inbox_tpl').html();
  var sideItemTpl = $('#side_item_tpl').html();

  function _getInbox() {
    $.getJSON('/ajax/mail/' + TAG + (BOX && ('/' + BOX) || '')).done(function(result) {
      console.log(result);

      var context = result.data;

      Handlebars.registerHelper('dateFormat', function(date) {
        return moment(date).lang('en').format('h:mm a');
      });

      Handlebars.registerHelper('isSeenClass', function(flags){
        // console.log(flags);
        // console.log("index of \\Seen:"+_indexOf.call(flags,'\\Seen'));
        if( _indexOf.call(flags,'\\Seen') > -1 ){
          return 'read';
        }
        return 'unread';
      });
      // Handlebars.registerHelper('fromFormat', function() {
      //   return this.from[0].slice(this.from[0].indexOf('<') + 1, this.from[0].indexOf('>'));
      // });

      $('#J_content').html(Handlebars.compile(inboxTpl)(context));
      $('#J_side_list').html(Handlebars.compile(sideItemTpl)(context));
    });
  }

  function _getBoxes() {
    $.getJSON('/ajax/mail/boxes').done(function(result) {
      console.log(result);
    });
  }

  _getInbox();
  // _getBoxes();
});
