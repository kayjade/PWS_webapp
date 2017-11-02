var record="0";

$(document).ready(function() {
  $("#start-record").click( function() {
  	if(record=="0"){
  	  $(".mode-body p").html("Recording now...");	
  	  $("#ongoing-record").css("color","#b4d5c4");
  	  record="1";
  	}
  });

  $("#stop-record").click( function() {
  	if(record=="1"){
  	  $(".mode-body p").html("Record ended. Click the button below to start recording again.");	
  	  $("#ongoing-record").css("color","#a8505f");
  	  record="0";
  	}
  });
});

//demo
//https://github.com/mdn/voice-change-o-matic/tree/gh-pages/scripts
//api docs
//https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API