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
  
})();