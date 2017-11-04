$(document).ready(function() {
  var record="0";

  navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

  var audioCtx;
  var bufferSize=1024;
  
  $("#start-record").click( function() {
  	if(record=="0"){
  	  $("#record-states").html("Recording now...");	
  	  $("#ongoing-record").css("color","#b4d5c4");
  	  record="1";

      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var source;
      var stream;

      var displayNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      displayNode.onaudioprocess = function(e) {
        var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);
        var outputStr = "";
        for (var i = 0; i < bufferSize; i++) {
          // Modify the input and send it to the output.
          output[i] = input[i];
        }
        console.log(output);
      }

      var gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;

      if(navigator.getUserMedia) {
        console.log('getUserMedia supported.');
        navigator.getUserMedia (
          {audio: true},
          function(stream) {
            source = audioCtx.createMediaStreamSource(stream);  
            source.connect(displayNode);
            displayNode.connect(gainNode);
            gainNode.connect(audioCtx.destination);
          },
          function(err) {
            console.log('The following gUM error occured: ' + err);
          }
        );
      } else {
        console.log('getUserMedia not supported on your browser!');
      }
  	}
  });

  $("#stop-record").click( function() {
  	if(record=="1"){
  	  $("#record-states").html("Record ended. Click the button below to start recording again.");	
  	  $("#ongoing-record").css("color","#a8505f");
  	  record="0";
      audioCtx.close();
  	}
  });

});

//demo
//https://github.com/mdn/voice-change-o-matic/tree/gh-pages/scripts
//api docs
//https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API