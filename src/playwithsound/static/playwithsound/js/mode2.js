var imageBinary;
var file;
// var styles;
var style;
var resultCheck;
var submissionId;
const maxImageSize = 960;
const imgWidth=960;
const imgHeight=500;

var deepArtEffectsClient = apigClientFactory.newClient({
	apiKey: 'Bj8MWIjI823neCfVMAsKg9w8Yov00ECNj9c8GWHi',
	accessKey: 'AKIAI4GN67R63D5QGQHA',
    secretKey: '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'
});

// we hardcode the style id due to limited access to api
var styles = ["01ab8da6-1b89-11e7-afe2-06d95fe194ed", "c7984d3c-1560-11e7-afe2-06d95fe194ed", "ed8e394f-1b90-11e7-afe2-06d95fe194ed",
	"c7984b32-1560-11e7-afe2-06d95fe194ed", "c7984cac-1560-11e7-afe2-06d95fe194ed", "c7984f92-1560-11e7-afe2-06d95fe194ed",
	"c7985469-1560-11e7-afe2-06d95fe194ed", "c7985759-1560-11e7-afe2-06d95fe194ed", "c7985796-1560-11e7-afe2-06d95fe194ed",
	"c79857d7-1560-11e7-afe2-06d95fe194ed", "c7985851-1560-11e7-afe2-06d95fe194ed", "c79859dc-1560-11e7-afe2-06d95fe194ed",
	"c7985a33-1560-11e7-afe2-06d95fe194ed", "c7985a74-1560-11e7-afe2-06d95fe194ed", "c7985ab5-1560-11e7-afe2-06d95fe194ed",
	"c7985af8-1560-11e7-afe2-06d95fe194ed", "c7985b3a-1560-11e7-afe2-06d95fe194ed", "c7985b7e-1560-11e7-afe2-06d95fe194ed",
	"c7985d24-1560-11e7-afe2-06d95fe194ed", "c7985de9-1560-11e7-afe2-06d95fe194ed", "c7985e32-1560-11e7-afe2-06d95fe194ed",
	"c798497e-1560-11e7-afe2-06d95fe194ed", "c7985718-1560-11e7-afe2-06d95fe194ed", "c7985bc1-1560-11e7-afe2-06d95fe194ed",
	"c7985541-1560-11e7-afe2-06d95fe194ed", "c7985d78-1560-11e7-afe2-06d95fe194ed", "c7984a8c-1560-11e7-afe2-06d95fe194ed",
	"c7984d82-1560-11e7-afe2-06d95fe194ed", "c7984e0d-1560-11e7-afe2-06d95fe194ed", "c79856d6-1560-11e7-afe2-06d95fe194ed",
	"c7985919-1560-11e7-afe2-06d95fe194ed", "c798595a-1560-11e7-afe2-06d95fe194ed", "c7984aeb-1560-11e7-afe2-06d95fe194ed",
	"c79854ee-1560-11e7-afe2-06d95fe194ed", "c7984650-1560-11e7-afe2-06d95fe194ed", "c79847f3-1560-11e7-afe2-06d95fe194ed",
	"c7985611-1560-11e7-afe2-06d95fe194ed", "c798568f-1560-11e7-afe2-06d95fe194ed", "c79848c7-1560-11e7-afe2-06d95fe194ed",
	"c79849d6-1560-11e7-afe2-06d95fe194ed", "c7984c1c-1560-11e7-afe2-06d95fe194ed", "c7984dc9-1560-11e7-afe2-06d95fe194ed"];

// show infomation of uploaded image in edit profile page
function fileInfo(event) {
    var files = event.target.files;
    file = files[0];
    if(files && file) {
    	//if(file.name.match(/\.wav$/i) || file.name.match(/\.mp3$/i)){
    	if(file.name.match(/\.wav$/i)){
			$('#upload-file-info').html(file.name);
    	}else{
    		alert('Sorry, only *.wav files are supported currently.');
		}
        /*ImageTools.resize(file, {width: maxImageSize, height: maxImageSize},
	    	function(blob, didItResize) {
				var reader = new FileReader();
				reader.onload = function(readerEvt) {
	            	imageBinary = btoa(readerEvt.target.result);
	        	};
        		reader.readAsBinaryString(blob);
	    	}
	    );*/
    }
}

$(document).ready(function(){

     $("#upload-button").on("click", function(){
     	// upload the audio file to the server
		if(file){
			var formData = new FormData();
			formData.append('audio', file);
			$.ajax({
            url: '/upload-audio/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false
        }).done(function (data) {
            if (data === "Success") {
                alert('Success')
            } else {
                alert('Failed to save image');
            }
        }).fail(function (data) {
        });
		} else {
			alert("Please choose a file first!");
		}
     	// upload image to deep art effects server
     	 /*var id = 1 + Math.floor(Math.random() * 42);
         style=styles[id].id;
         uploadImage(style);*/
     });

     // ajax setup
	// using jQuery
  	// https://docs.djangoproject.com/en/1.11/ref/csrf/
  	function getCookie(name) {
    	var cookieValue = null;
    	if (document.cookie && document.cookie !== '') {
        	var cookies = document.cookie.split(';');
        	for (var i = 0; i < cookies.length; i++) {
            	var cookie = jQuery.trim(cookies[i]);
            	// Does this cookie string begin with the name we want?
            	if (cookie.substring(0, name.length + 1) === (name + '=')) {
                	cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                	break;
            	}
        	}
    	}
    	return cookieValue;
  	}
  	var csrftoken = getCookie('csrftoken');

	function csrfSafeMethod(method) {
    	// these HTTP methods do not require CSRF protection
    	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  	}

	$.ajaxSetup({
      	beforeSend: function(xhr, settings) {
          	if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
              	xhr.setRequestHeader("X-CSRFToken", csrftoken);
          	}
      	}
  	});
});

function uploadImage(styleId) {
	if(imageBinary==null) {
		alert('Please choose a picture first');
		return;
	}

	var header = {
		'Access-Control-Allow-Credentials': true,
		'Access-Control-Allow-Origin': '*'
	};

	var body = {
		'styleId': styleId,
		'imageBase64Encoded': imageBinary,
		'optimizeForPrint': true,
		'useOriginalColors': false,
		'imageSize': maxImageSize
	};

	deepArtEffectsClient.uploadPost(header, body)
	.then(function(result) {
		console.log("Successfully uploaded image");
		submissionId = result.data.submissionId;
		resultCheck = setInterval(imageReadyCheck, 10000);
	}).catch(function(result){
        //This is where you would put an error callback
        console.log("Error uploading image");
        console.log(result);
    });
}

function imageReadyCheck() {
	var params = {
    	submissionId: submissionId,
	};
	deepArtEffectsClient.resultGet(params)
	.then(function(result) {
		console.log("Successfully status check");
		if(result.data.status=="finished") {
			var pic = $("#result img");
			pic.attr('src', result.data.url);
			$("#result").show();
			clearInterval(resultCheck);
		}
	}).catch(function(result){
        console.log("Error checking status");
    });
}