var audioCtx;
var recorder;
var audioblob;
$(document).ready(function () {
    var analyzer = new Analyzer();
    var isRecording = "0";
    var recordNum=0;
    var mn; // user-selected style

    init();

    $("#start-record").click(function () {
        if (isRecording === "0") {
            if (recordNum === 0 && $('#is-authenticated').length <= 0) {
                // unlogged in
                //alert("If you want to save your image and recording, please login.");
                $('#login-alert').modal('show');
                recordNum=recordNum+1;
            }
                var savebutton = $(".record-control").find('button');
                if (savebutton.length > 0) {
                    savebutton.remove();
                }
                mn= $("#select-style select").val();
                $("#record-states").html("Recording now...");
                $("#ongoing-record").css("color", "#b4d5c4");
                isRecording = "1";
                analyzer && analyzer.startRecording();
                recorder && recorder.record();

                drawpicture(analyzer, mn);
                $("#record-result").hide();
                $("#saveButton").hide();
        }

        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }

        var csrftoken = getCookie('csrftoken');
        $.ajaxSetup({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        });
    });

    $("#stop-record").click(function () {
        if (isRecording === "1") {
            $("#record-states").html("Record ended. Click the button below to start recording again.");
            $("#ongoing-record").css("color", "#a8505f");
            isRecording = "0";
            analyzer.stopRecording();

            recorder && recorder.stop();
            createDownloadLink(); // please look into this function below
            recorder.clear(); // important

            stopdrawpicture(mn);
            $("#saveButton").show();
            $("#record-result").show();
            // $(".record-control").append("<button id=\'saveButton\'>Save you creation to your album</button>");
            // $(".mode-body").append("<button id='downloadimage'>Download you picture</button>");
            // $(".mode-body").append("<button id='downloadaudio'>Download you audio</button>");
            $("#saveButton").on('click', function () {
                $("#save-modal").modal("show");
                //saveimage(mn)

                // confirm save to album
                $("#confirm-save-btn").on('click', function () {
                    $("#save-modal").modal("hide");
                    saveimage(mn)
                });

                // create a new album
                $("#create-new-album").on('click', function(e) {
                    e.preventDefault();
                    if($('#is-authenticated').length <= 0){
                        // unauthenticated
                        $("#save-modal").modal("hide");
                        $('#login-alert').modal('show');
                    }else{
                        $("#modal-confirm-save").hide();
                        $("#modal-create-new").show();
                    }
                });

                $("#confirm-create").on('click', function(e) {
                    e.preventDefault();
                });

                // cancel create new album. go back to save page
                $("#cancel-create").on('click', function(e) {
                    e.preventDefault();
                    $("#modal-create-new").hide();
                    $("#modal-confirm-save").show();
                });
            });

            $("#downloadimage").on('click', function () {
                downloadimage(mn)
            });
            $("#downloadaudio").on('click', function () {
                var event = new MouseEvent("click");
                hf.dispatchEvent(event);
            });

            //recorder.getTimeData();
        }
    });

});

function createDownloadLink() {
    // .exportWAV(callback) generate a blob containing wav audio data
    // visit https://github.com/mattdiamond/Recorderjs for more information
    recorder && recorder.exportWAV(function (blob) {
        audioblob = blob;
        var url = URL.createObjectURL(blob);
        var li = document.createElement('li');
        var au = $("#usr-audio");
        hf = document.createElement('a');

        au.controls = true;
        au.attr("src", url);
        hf.href = url;
        hf.download = new Date().toISOString() + '.wav';
        hf.innerHTML = hf.download;
        //li.appendChild(au);
        //li.appendChild(hf);
        //$("#recording-list").append(li);

    });
}

function startUserMedia(stream) {
    var input = audioCtx.createMediaStreamSource(stream);
    console.log('Media stream created.');

    recorder = new Recorder(input);
    console.log('Recorder initialised.');
}

function init() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context set up.');
        console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: true}, startUserMedia, function (e) {
        console.log('No live audio input: ' + e);
    });

    $("#record-result").hide();
    $("#saveButton").hide();
}