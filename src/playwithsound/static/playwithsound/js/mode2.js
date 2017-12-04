var imageBinary;
var resultImg;
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
    }
}

$(document).ready(function(){
	if($('#is-authenticated').length <= 0) {
		$('#login-alert').modal("show");
	}

	// upload audio file
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
        	imageBinary = data;
        	// uoload file to deep art effect
			styleId = Math.round(Math.random()*100)%styles.length;
			uploadImage(styles[styleId], data);
			$('#result').hide();
            $('#load-wrapper').show();
        }).fail(function (data) {
        });
		} else {
			alert("Please choose a file first!");
		}
     });

     $("#saveButton").unbind('click').on('click', function () {
		 $("#save-modal").modal("show");

		 // confirm save to album
		 $("#confirm-save-btn").unbind('click').on('click', function () {
			 $("#save-modal").modal("hide");
			 uploadToServer();
		 });

		 // create a new album
		 $("#create-new-album").unbind('click').on('click', function(e) {
			 e.preventDefault();
			 $("#modal-confirm-save").hide();
			 $("#modal-create-new").show();
			 // clear former input
			 $("input#album-name:text").val("");
			 $("p.error-info").text("");
		 });

		 $("#confirm-create").unbind('click').on('click', function(e) {
			 e.preventDefault();
			 if($("input#album-name:text").val().length<=0){
				 $("p.error-info").text("Please enter a valid album name!");
				 $("input#album-name:text").val("");
			 }
			 var formData = $("#create-album-form").serialize();
			 $.post("/create-new-album/", formData, function(data){
				 if(data['success']){
					 // create new album success
					 // update album list
					 var album_list = $('#select-album select');
					 var new_album = $("<option selected=\"selected\"></option>").text(data['new_album']);
					 album_list.append(new_album);
					 // clear former input
					 $("input#album-name:text").val("");
					 $("p.error-info").text("");
					 $("#modal-create-new").hide();
					 $("#modal-confirm-save").show();
				 }else{
					 $("p.error-info").text(data['info']);
				 }
			 });
		 });

                // cancel create new album. go back to save page
		 $("#cancel-create").unbind('click').on('click', function(e) {
			 e.preventDefault();
			 $("#modal-create-new").hide();
			 $("#modal-confirm-save").show();
		 });
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
		alert('Oops! Something went wrong');
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
			$('#load-wrapper').hide();
			// show result
			var pic = $("#result img");
			pic.attr('src', result.data.url);
			$("#downloadimage").attr("href", result.data.url);
			$("#result").show();
			clearInterval(resultCheck);
			getResultImage(result.data.url);
		}
	}).catch(function(result){
		console.log(result);
        console.log("Error checking status");
    });
}

function getResultImage(imgUrl) {
	if(file){
		var proxyURL = 'https://cors-anywhere.herokuapp.com';
		var xhr = new XMLHttpRequest();
		xhr.open('GET', proxyURL + "/" + imgUrl, true);
		xhr.setRequestHeader("Access-Control-Allow-Credentials",true);
		xhr.setRequestHeader("Access-Control-Allow-Origin","*");
		xhr.responseType = 'blob';

		xhr.onload = function(e) {
	  		if (this.status == 200) {
    			resultImg = this.response;
  			}
		};
		xhr.onerror=function(e){
			alert("xhr fail")
		};
		xhr.send();
	}else{
		alert("empty file");
	}
}

/*
 upload image and audio file to the server
 */
function uploadToServer() {
	if(file && resultImg) {
		var choosen_album = $("#select-album option:selected").text();
		var description = $("textarea").val();
		var fd = new FormData();
		// send request to server
		fd.append("ImageData", resultImg);
        fd.append("AudioData", file);
        fd.append("Album", choosen_album);
        if(description != ""){
            fd.append("Description", description);
            console.log(description);
        }
        $.ajax({
            url: '/saveimage',
            type: 'POST',
            data: fd,
            processData: false,
            contentType: false
        }).done(function (data) {
            if (data === "Success") {
                alert('Success')
            } else {
                alert('Failed to save image');
            }
        }).fail(function (data) {
        	alert("fail to save image");
        });
	}else{
		alert("file empty");
	}
}