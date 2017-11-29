$(document).ready(function() {
  var kudos=0; // do not like this image

  $(".single-painting").on("click", "i", function(event){
    if(kudos===0){
        $(this).attr("class", "fa fa-heart");
        kudos=1;
    }else{
        $(this).attr("class","fa fa-heart-o");
        kudos=0;
    }
  });

  $("a[id^='aModal']").each(function(){
      $(this).unbind('click').on('click', function(){
          var aid = this.id.substr(6);
          $("#audioModal"+aid).attr("src","/getaudio/"+aid);
      });
    });

  // load more images in popular & new stream
  $("#load-more button").on('click', function(e){
      e.preventDefault();
      setLastID(1);
      var formData=$("#load-more form").serialize();
      console.log(formData);

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
});

// set last_id in load_more form
function setLastID( type ) {
  last_id = $("#view-paintings .col-md-4:last-child").attr("painting_id");
  if(type==0){
      // in view my album page
     $("#album-load-more input:first-child").attr("value", last_id);
  }else if(type==1){
      $("#load-more input:first-child").attr("value", last_id);
  }
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
        tmpModal.find(".kudos").html(res.paintings[i].kudos + " Kudos");
        tmpModal.find(".paintingUser").html(res.paintings[i].username + " ");
        tmpModal.find(".paintingTime").html(res.paintings[i].time);
        modalList.append(tmpModal);
    }
}