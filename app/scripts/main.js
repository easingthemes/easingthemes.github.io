jQuery(document).ready(function($) {
  var url = {
    query: 'cofee',
    type: 'place',
    center: '3',
    distance: '1000',
    access_token: '605157829620558',
    secret: 'd847b7bcb424768ed2ca42f3e2aee8d1',
    fb: 'https://graph.facebook.com/search?'
  }
  $.ajax({
    url: fb + 'q=' + query + '&type=' + type + '&center=' + center + '&distance=' + distance + '&access_token=' + access_token + '|' + secret
    //url: 'https://graph.facebook.com/search?q=coffee&type=place&center=37.76,-122.427&distance=1000&access_token=605157829620558|d847b7bcb424768ed2ca42f3e2aee8d1',
    // type: 'default GET (Other values: POST)',
    // dataType: 'default: Intelligent Guess (Other values: xml, json, script, or html)',
    // data: {param1: 'value1'},
  })
  .done(function(data) {
    console.log(data);
  })
  .fail(function() {
    console.log("error");
  })
  .always(function() {
    console.log("complete");
  });
  
});