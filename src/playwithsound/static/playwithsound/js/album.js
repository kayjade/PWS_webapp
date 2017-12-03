$(document).ready(function(){
    // manage album
    $("#manage-album").on("click", function(){
        $("#manage-album").hide();
        $("#create-btn-group").show();
        $("#view-my-album").children().find(".delete-btn-group").show();
    });

    // cancel management
    $("#cancel-create").on("click", function(){
        $("#manage-album").show();
        $("#create-btn-group").hide();
        $("#view-my-album").children().find(".delete-btn-group").hide();
    });

    // show create album modal
    $("#create-album").on("click", function(){
        $("#create-album-modal").modal("show");
        $("input#album-name:text").val("");
        $("p.error-info").text("");
    });

    // create album
    $("#confirm-create").unbind('click').on('click', function(e) {
        e.preventDefault();
        if($("input#album-name:text").val().length<=0){
            $("p.error-info").text("Please enter a valid album name!");
            $("input#album-name:text").val("");
        }
        var formData = $("#create-album-form").serialize();
        $.post("/create-new-album/", formData, function(data){
            res = JSON.parse(data);
            if(res.success){ // create new album success
                // clear former input
                $("input#album-name:text").val("");
                $("p.error-info").text("");

                // update album list
                $("#create-album-modal").modal("hide");
                console.log(res);
                var albumList = $("#view-my-album .row");
                var tmpAlbum = $("#view-my-album .col-md-4:first-child").clone(true);
                tmpAlbum.attr("album_id", res.album_id);
                // a newly created album does not contain any image
                tmpAlbum.find(".img-responsive").attr("src", res.cover);
                tmpAlbum.find("a").attr("href", res.link);
                tmpAlbum.find(".viewmore-overlay h2").html(res.new_album);
                albumList.append(tmpAlbum);
            }else{
                $("p.error-info").text(res.info);
            }
        });
    });

    // delete album
    $("#view-my-album").on("click", "button", function(){
        var tobeDelete = $(this).closest(".col-md-4");
        var id = tobeDelete.attr("album_id");
        console.log(id);
        //tobeDelete.remove();
        $("#delete-alert").modal("show");
        $("#confirm-delete").unbind("click").on("click", function(){
            $.post("/delete-album/" + id + "/", function(data){
                if(data.length>0){
                    console.log(tobeDelete);
                    tobeDelete.remove();
                }else{
                    alert("Oops! Something went wrong.");
                }
            });
            $("#delete-alert").modal("hide");
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