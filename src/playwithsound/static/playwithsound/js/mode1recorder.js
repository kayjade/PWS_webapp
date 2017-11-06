'use strict';

function Recorder() {

  navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

  var audioCtx;
  //var bufferSize = 4096;

  var requestId;

  const bufferSize = 256;
  var originFreqBuffer = new Uint8Array(bufferSize);
  var originTimeBuffer = new Uint8Array(bufferSize);
  var convFreqBuffer = new Uint8Array(bufferSize);
  var convTimeBuffer = new Uint8Array(bufferSize);
  var tIndex = 0;

  function startRecording() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    var source;
    var stream;
    //var mediaRecorder; 
    var analyser1 = audioCtx.createAnalyser();
    var analyser2 = audioCtx.createAnalyser();

    // create convolver node and set buffer
    var convolverNode = audioCtx.createConvolver();
    var request = new XMLHttpRequest();
    // use CORS
    if ("withCredentials" in request) {
      request.open("GET", "/get_conv_audio/", true);
    } else if (typeof XDomainRequest != "undefined") {
      request = new XDomainRequest();
      request.open("GET", "/Library/concert-crowd.ogg");
    }
    request.responseType = 'arraybuffer';
    request.onload = function() {
      var audioData = request.response;

      audioCtx.decodeAudioData(audioData, function(buffer) {
        convolverNode.buffer = buffer;
      });
    }

    request.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

    request.send();

    if(navigator.getUserMedia) {
      console.log('getUserMedia supported.');
      navigator.getUserMedia ({
        audio: true
      },
      function(stream) {
        //mediaRecorder = new MediaRecorder(stream);

        source = audioCtx.createMediaStreamSource(stream);  
        source.connect(analyser1);
        analyser1.connect(convolverNode);
        convolverNode.connect(analyser2);
        //analyser2.connect(audioCtx.destination);

      },
        function(err) {
          console.log('The following gUM error occured: ' + err);
        }
      );
    } else {
      console.log('getUserMedia not supported on your browser!');
    }

    extractData();

    /* extract data from analyser node */
    function extractData() {
      analyser1.getByteFrequencyData(originFreqBuffer);
      analyser1.getByteTimeDomainData(originTimeBuffer);
      analyser2.getByteFrequencyData(convFreqBuffer);
      analyser2.getByteTimeDomainData(convTimeBuffer);

      requestId = requestAnimationFrame(extractData);
    }
  }

  function stopRecording() {
    cancelAnimationFrame(requestId);
    audioCtx.close();
  }

  return {
    startRecording: startRecording,
    stopRecording: stopRecording,
    timeData: originTimeBuffer,
    freqData: originFreqBuffer,
    convFreqData: convFreqBuffer,
    convTimeData: convTimeBuffer
  };
}

//demo
//https://github.com/mdn/voice-change-o-matic/tree/gh-pages/scripts
//api docs
//https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
//http://ianreah.com/2013/02/28/Real-time-analysis-of-streaming-audio-data-with-Web-Audio-API.html
//http://papers.traustikristjansson.info/?p=486
//https://github.com/mdn/web-dictaphone/blob/gh-pages/scripts/app.js