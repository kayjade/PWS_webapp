$(document).ready(function() {
  var recorder = new Recorder();
  var isRecording="0";
  
  $("#start-record").click( function() {
  	if(isRecording=="0"){
  	  $("#record-states").html("Recording now...");	
  	  $("#ongoing-record").css("color","#b4d5c4");
  	  isRecording="1";
      recorder.startRecording();
  	}
  });

  $("#stop-record").click( function() {
  	if(isRecording=="1"){
  	  $("#record-states").html("Record ended. Click the button below to start recording again.");	
  	  $("#ongoing-record").css("color","#a8505f");
  	  isRecording="0";
      recorder.stopRecording();
      //console.log(recorder.getTimeData());
      //recorder.getTimeData();
  	}
  });

});