jQuery(document).ready(function(a){var b={query:"cofee",type:"place",center:"3",distance:"1000",access_token:"605157829620558",secret:"d847b7bcb424768ed2ca42f3e2aee8d1",fb:"https://graph.facebook.com/search?"};a.ajax({url:b.fb+"q="+b.query+"&type="+b.type+"&center="+b.center+"&distance="+b.distance+"&access_token="+b.access_token+"|"+b.secret}).done(function(a){console.log(a)}).fail(function(){console.log("error")}).always(function(){console.log("complete")})});