$(document).ready(function() {
  var recorder = new Recorder();
  var isRecording="0";
  
  $("#start-record").click( function() {
  	if(isRecording=="0"){
  	  if ($('#is-authenticated').length <= 0) {
        // unlogged in
        alert("If you want to save your image and recording, please login.");
      }
  	  $("#record-states").html("Recording now...");	
  	  $("#ongoing-record").css("color","#b4d5c4");
  	  isRecording="1";
      recorder.startRecording();
      drawpicture(recorder);

  	}
  });

  $("#stop-record").click( function() {
  	if(isRecording=="1"){
  	  $("#record-states").html("Record ended. Click the button below to start recording again.");	
  	  $("#ongoing-record").css("color","#a8505f");
  	  isRecording="0";
      recorder.stopRecording();
      stopdrawpicture();
      //recorder.getTimeData();
  	}
    // get audio data
    console.log(recorder.timeData);
    console.log(recorder.freqData);
    console.log(recorder.convTimeData);
    console.log(recorder.convFreqData);

  });

});
