(function(){
  
  var mapCountries;
  var listCountries;
  
  var $countryName = $("#user-country-name");
  var $timezone = $("#user-timezone");
  
  // Get collection of countries on first focus
  $countryName.one("focus", function(){
    $.get("/data/countries.json", initCountryNameInput);
  });
  
  // Init country input
  function initCountryNameInput(data){
    $countryName.typeahead({
      source : function(query, process){
        if (!mapCountries || !listCountries){
          mapCountries = {};
          listCountries = [];
          $.each(data, function(i, country){
            mapCountries[country.name] = country;
            listCountries.push(country.name);
          });
        }
        process(listCountries);
      }
    }).on("change", function(){
      var value = $(this).val();
      var country = mapCountries[value];
      $("#user-country-cca2").val(country ? country.cca2 : "");
    });
  }
  
  // Init timezone selector
  $timezone
  .selectpicker({
    style : "btn-default",
    width : "100%",
    showSubtext : true,
    container : "body"
  });
  
  // Get collection of timezones on first focus
  $.get("/data/timezones.json", initTimezoneInput);
  
  // Populate timezone input
  function initTimezoneInput(data){
    $.each(data, function(i, group){
      var $optgroup = $("<optgroup label='" + group.group + "'></optgroup>");
      $.each(group.zones, function(k, zone){
        $optgroup.append(
          "<option value='" + zone.value + "' data-subtext='" + zone.value + "'>" + zone.name + "</option>"
        );
      });
      $timezone.append($optgroup);
    });
    $timezone
      .selectpicker("val", $timezone.data("value"))
      .selectpicker("refresh");
  }
  
  // Render actual parameters on player delete confirm
  $(document).on("click", ".btn-player-delete", function(){
    var userId = $(this).data("user_id");
    var playerId = $(this).data("player_id");
    var playerName = $(this).data("player_name");
    $("#player-delete-confirm form").attr("action", "/user/" + userId + "/player/destroy/" + playerId);
    $("#player-delete-confirm #player-delete-confirm-name").text(playerName);
  });
  
  // Init upload avatar button
  $(function(){
    
    if (window.File && window.FileReader){ //These are the relevant HTML5 objects that we are going to use 
      initUploadControls();
    }else{
      console.log("Old Browser");
    }
    
    function initUploadControls(){
      
      var $avatar = $("#avatar");
      var originalPath = $avatar.attr("src");
      
      function hideAvatarControls(){
        $("#btn-reset-avatar").hide();
        $("#btn-submit-avatar").hide();
      }
      
      function showAvatarControls(){
        $("#btn-reset-avatar").show();
        $("#btn-submit-avatar").show();
      }
      
      hideAvatarControls();
      
      function resetAvatar(){
        $avatar.attr("src", originalPath);
        $("[name='tmppath']").val("");
        hideAvatarControls();
      }
    
      $("#btn-user-avatar").attr("disabled", false).on("click", function(){
        $("#user-avatar").trigger("click");
      });
      
      $("#user-avatar").val("").on("change", function(e){
        if (!e.target.files.length) return resetAvatar();
        $("#btn-user-avatar").attr("disabled", true);
        var userId = $(this).data("user_id");
        var csrf = $(this).siblings("[name='_csrf']").val();
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
          var params = {
            _csrf  : csrf,
            file   : {
              name : file.name,
              size : file.size,
              type : file.type,
              data : e.target.result
            }
          };
          socket.post("/user/" + userId + "/uploadavatar", params, function(response){
            $("#btn-user-avatar").attr("disabled", false);
            if (response.code == 500){
              var $alert = $("#error-alert");
              $alert.find(".error-message").text(response.error);
              $alert.modal("show");
            }else{
              $avatar.attr("src", response.data);
              $("[name='tmppath']").val(response.path);
              showAvatarControls();
            }
          });
        };
        reader.readAsDataURL(file);
      });
      
      $("#btn-reset-avatar").on("click", resetAvatar);
    }
    
  });
  
})();