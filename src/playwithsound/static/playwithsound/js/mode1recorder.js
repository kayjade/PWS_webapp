'use strict';

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

const bufferSize = 256;
const freqency = 400;
var freqData = new Float32Array(freqency);
var timeData = new Float32Array(freqency);
var tIndex = 0;

function Recorder() {
  var audioCtx;
  //var bufferSize = 4096;

  var requestId;

  function startRecording() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source;
    var stream;
    var analyser = audioCtx.createAnalyser();
    //analyser.fftSize = 256;

    var freqBuffer = new Float32Array(bufferSize);
    var timeBuffer = new Float32Array(bufferSize);

    if(navigator.getUserMedia) {
      console.log('getUserMedia supported.');
      navigator.getUserMedia (
        {
          audio: true
        },
        function(stream) {
          source = audioCtx.createMediaStreamSource(stream);  
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          //source.connect(extractNode);
          //extractNode.connect(audioCtx.destination);
        },
          function(err) {
            console.log('The following gUM error occured: ' + err);
          }
        );
      } else {
        console.log('getUserMedia not supported on your browser!');
      }

      extractData();

      function extractData() {
        analyser.getFloatFrequencyData(freqBuffer);
        analyser.getFloatTimeDomainData(timeBuffer);

        for(var i=0; i<bufferSize; i++){
          freqData[tIndex] = freqBuffer[i];
          timeData[tIndex] = timeBuffer[i];
          tIndex = (tIndex + 1) % freqency;
          console(tIndex);
          console.log(freqData[tIndex]);
          console.log(freqBuffer[i]);
        }
        //console.log(freqBuffer);
        //console.log(timeBuffer);

        requestId = requestAnimationFrame(extractData);
      }

      function start() {
        if (!requestId) {
         requestId = window.requestAnimationFrame(extractData);
        }
      }

  }
  function stopRecording() {
    cancelAnimationFrame(requestId);
    audioCtx.close();
  }

  function getTimeData() {
    console.log(timeData);
    return timeData;
  }

  function getFreqData() {
    return freqData;
  }

  return {
    startRecording: startRecording,
    stopRecording: stopRecording,
    getTimeData: getTimeData,
    getFreqData: getFreqData
  };
}

//demo
//https://github.com/mdn/voice-change-o-matic/tree/gh-pages/scripts
//api docs
//https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
//http://ianreah.com/2013/02/28/Real-time-analysis-of-streaming-audio-data-with-Web-Audio-API.html
//http://papers.traustikristjansson.info/?p=486