
$('#myForm').submit((e) => {
  e.preventDefault();
  $('#dimmer').dimmer('add content', $('#resultContainer'));
  $('#dimmer').dimmer('show');
})