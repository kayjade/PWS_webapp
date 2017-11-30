$(document).ready(function() {

    // like & unlike paintings
  $("#single-painting").on("click", "i", function(event){
      if($('#is-authenticated').length <= 0){ //unauthorized user
          alert("Oops! You have to login to give kudos :P");
      }else{
          var paintingId = $(this).closest(".painting-modal").attr("id").substr(13);
          var icon = $(this);
          if($(this).attr("class")=="fa fa-heart-o"){ // like this painting
              $.post("/like/" + paintingId + "/", function(res) {
                  if(res.length>0){ // success
                      icon.attr("class", "fa fa-heart");
                      icon.next().find(".kudos").html(res);
                  }
              });
          }else{ // unlike this painting
              $.post("/unlike/" + paintingId + "/", function(res) {
                  if(res.length>0){ // success
                      icon.attr("class", "fa fa-heart-o");
                      icon.next().find(".kudos").html(res);
                  }
              });
          }
      }
  });

  $("a[id^='aModal']").each(function(){
      $(this).unbind('click').on('click', function(){
          var aid = this.id.substr(6);
          $("#audioModal"+aid).attr("src","/getaudio/"+aid);
      });
    });

  // load more images in popular & new stream
  $("#stream-load-more button").on('click', function(e){
      e.preventDefault();
      // check the stream type
      var view_type=$("#stream-load-more input:nth-child(2)").val();
      if(view_type==0){ // popular paintings
          setPaintingNum();
          var formData=$("#stream-load-more form").serialize();
          $.post("/gallery-load-more-popular/", formData, function(data){
              streamLoadPainting(data);
          });
      }else{ // new paintings
          setLastID(1);
          var formData=$("#stream-load-more form").serialize();
          $.post("/gallery-load-more-new/", formData, function(data){
              streamLoadPainting(data);
          });
      }

      // get the id of the last painting
      //$("#view-paintings .col-md-4:last-child").attr("painting_id");
  });

  // load more images in album view
  $("#album-load-more button").on('click', function(e){
      e.preventDefault();
      setLastID(0);
      var formData=$("#album-load-more form").serialize();
      console.log(formData);
      // send request
      $.post("/gallery-load-more-album/",formData, function(data){
          var res = JSON.parse(data);
          if(res.success){
              if(res.exist){
                  loadPainting(res);
              }else{
                  // no more paintings to load
                  $("#album-load-more button").hide();
                  $("#album-load-more p").html("There's no more paintings in this album.")
              }
          }else{
              alert("Oops! Something went wrong");
          }
      })
  });

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

// set last_id in load_more form
function setLastID( type ) {
  var last_id = $("#view-paintings .col-md-4:last-child").attr("painting_id");
  if(type==0){
      // in view my album page
     $("#album-load-more input:first-child").attr("value", last_id);
  }else if(type==1){
      $("#stream-load-more input:first-child").attr("value", last_id);
  }
}

// set the kudos number of the last painting in load more form
function setPaintingNum(){
    var num = $("#view-paintings .col-md-4").length;
    $("#stream-load-more input:nth-child(3)").attr("value", num);
}

// load more paintings
function loadPainting( res ){
    var paintingList = $("#view-paintings");
    var modalList = $("#single-painting");
    for(var i=0; i< res.paintings.length; i++) {
        // load paintings
        var tmpPainting = $("#view-paintings .col-md-4:first-child").clone(true);
        tmpPainting.attr("painting_id", res.paintings[i].id);
        tmpPainting.find(".img-responsive").attr("src", "/getimage/" + res.paintings[i].id);
        tmpPainting.find("a").attr("id", "aModal" + res.paintings[i].id);
        tmpPainting.find("a").attr("href", "#paintingModal" + res.paintings[i].id);
        paintingList.append(tmpPainting);
        // load modal
        var tmpModal = $("#single-painting .painting-modal:first-child").clone(true);
        tmpModal.attr("id", "paintingModal" + res.paintings[i].id);
        tmpModal.find(".img-responsive").attr("src", "/getimage/" + res.paintings[i].id);
        tmpModal.find("audio").attr("id", "audioModal" + res.paintings[i].id);
        tmpModal.find(".kudos").html(res.paintings[i].kudos);
        tmpModal.find(".paintingUser").html(res.paintings[i].username + " ");
        tmpModal.find(".paintingTime").html(res.paintings[i].time);
        if(res.paintings[i].kudos_user){
            tmpModal.find("i").attr("class", "fa fa-heart");
        }else{
            tmpModal.find("i").attr("class", "fa fa-heart-o");
        }
        modalList.append(tmpModal);
    }
}

function streamLoadPainting( data ){
    var res = JSON.parse(data);
        if(res.success){
            if(res.exist){
                loadPainting(res);
            }else{
                // no more paintings to load
                $("#stream-load-more button").hide();
                $("#stream-load-more p").html("No more paintings.")
            }
        }else{
            alert("Oops! Something went wrong");
        }
}