(function(){
  
  var timezone = $("#user-timezone").text();
  
  // Render time
  function renderTime(){
    var actualTime = moment().tz(timezone);
    $("#user-actual-time").text(actualTime.format("ddd, HH:mm ") + actualTime.zoneAbbr());
  }
  
  // Render user actual time
  if (timezone != ""){
    renderTime();
    setInterval(renderTime, 1000); // Update time every 1000ms
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