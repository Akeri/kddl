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
  
  // Render actual parameters on player power breakdown
  $(document).on("click", ".btn-player-power-breakdown", function(){
    var playerName = $(this).data("player_name");
    var power = $(this).data("player_power");
    $dialog = $("#player-power-breakdown");
    $dialog.find("#player-power-breakdown-name").text(playerName);
    $dialog.find("#player-power-breakdown-base").text(power.base);
    $dialog.find("#player-power-breakdown-pctg").text(power.bonus.pctg);
    $dialog.find("#player-power-breakdown-total").text(Math.round(power.score));
    power.groups.sort(function(a, b){
      return b.score - a.score;
    });
    var $tbody = $dialog.find("table > tbody").empty();
    var content = "<tr>";
    $.each(power.groups, function(i, group){
      if (i % 2 == 0) content += "</tr><tr>";
      var totalCount = group.count;
      var count = totalCount > 3 ? 3 : totalCount;
      var countLabel = count.toString();
      if (count != totalCount) countLabel += " (" + totalCount + ")";
      content +=
        "<td>" + group.elemUi + "</td>" +
        "<td>x" + count + "</td>" +
        "<td>= " + Math.round(group.score) + "</td>";
    });
    console.log(power.groups.length);
    if (power.groups.length % 2 != 0)
      content += "<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>";
    content += "</tr>";
    $tbody.append(content);
  });
  
})();