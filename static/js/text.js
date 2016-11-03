//  global variables

socket = io();

//  event handlers

$('#terminal').keypress(function(event) {
  // When 'enter' is pressed in the user ID box, it should be treated as
  // clicking on the 'submit' button.
  if (event.keyCode === 13) {
    submit();
  }
});

$('#submit_button').click(submit);