$(document).ready(function () {
    var recorder = new Recorder();
    var isRecording = "0";

    $("#start-record").click(function () {
        if (isRecording == "0") {
            if ($('#is-authenticated').length <= 0) {
                // unlogged in
                alert("If you want to save your image and recording, please login.");
            }
            var savebutton = $(".record-control").find('button');
            if (savebutton.length > 0) {
                savebutton.remove();
            }
            $("#record-states").html("Recording now...");
            $("#ongoing-record").css("color", "#b4d5c4");
            isRecording = "1";
            recorder.startRecording();
            drawpicture(recorder);

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
        if (isRecording == "1") {
            $("#record-states").html("Record ended. Click the button below to Restart.");
            $("#ongoing-record").css("color", "#a8505f");
            isRecording = "0";
            recorder.stopRecording();
            stopdrawpicture();
            $(".record-control").append("<button id=\'saveButton\'>Save you audio and picture</button>");
            $("#saveButton").on('click',function(){
                saveimage()
            });

            //recorder.getTimeData();
        }
        // get audio data
        console.log(recorder.timeData);
        console.log(recorder.freqData);
        console.log(recorder.convTimeData);
        console.log(recorder.convFreqData);

    });

});

