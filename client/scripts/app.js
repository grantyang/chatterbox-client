// YOUR CODE HERE:
// Server: http://parse.sfm6.hackreactor.com/
// escape notes: &, <, >, ", ', `, , !, @, $, %, (, ), =, +, {, }, [, and ] 
// http://parse.sfm6.hackreactor.com/chatterbox/classes/messages
//
// $.ajax({
//   // This is the url you should use to communicate with the parse API server.
//   url: 'http://parse.CAMPUS.hackreactor.com/chatterbox/classes/messages',
//   type: 'POST',
//   data: JSON.stringify(message),
//   contentType: 'application/json',
//   success: function (data) {
//     console.log('chatterbox: Message sent');
//   },
//   error: function (data) {
//     // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//     console.error('chatterbox: Failed to send message', data);
//   }
// });

$.ajax({
  // This is the url you should use to communicate with the parse API server.
  url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
  type: 'GET',
  contentType: 'application/json',
  success: console.log(data),
  error: function (data) {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
    console.error('chatterbox: GET request failed', data);
  }
});