var imageBinary;
var styles;
var style;
var resultCheck;
var submissionId;
const maxImageSize = 960;
const imgWidth=960;
const imgHeight=500;

var deepArtEffectsClient = apigClientFactory.newClient({
	apiKey: 'Bj8MWIjI823neCfVMAsKg9w8Yov00ECNj9c8GWHi',
	accessKey: 'AKIAIZBZHH3WWJQIMNQA',
    secretKey: '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'
});

// show infomation of uploaded image in edit profile page
function fileInfo(event) {
    var files = event.target.files;
    var file = files[0];
    if(files && file) {
        $('#upload-file-info').html(file.name);
        ImageTools.resize(file, {width: maxImageSize, height: maxImageSize},
	    	function(blob, didItResize) {
				var reader = new FileReader();
				reader.onload = function(readerEvt) {
	            	imageBinary = btoa(readerEvt.target.result);
	        	};
        		reader.readAsBinaryString(blob);
	    	}
	    );
    }
}

$(document).ready(function(){
    deepArtEffectsClient.stylesGet()
        .then(function(result){ // success call back
            console.log("Successfully loaded styles");
            styles = result.data;
        }).catch(function(result){ // error callback
        console.log("Error loading styles");
    });

     $("#upload-button").on("click", function(){
         style=styles[0].id;
         uploadImage(style)
     })
});

function uploadImage(styleId) {
	if(imageBinary==null) {
		alert('Please choose a picture first');
		return;
	}

	var header = {

    };

	var body = {
		'styleId': styleId,
		'imageBase64Encoded': imageBinary,
		'optimizeForPrint': true,
		'useOriginalColors': true,
		'imageSize': maxImageSize
	};

	deepArtEffectsClient.uploadPost(null, body)
	.then(function(result) {
		console.log("Successfully uploaded image");
		submissionId = result.data.submissionId;
		resultCheck = setInterval(imageReadyCheck, 2500);
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
		}
	}).catch(function(result){
        console.log("Error checking status");
    });
}