// Render actual parameters on armor delete confirm
$(document).on("click", ".btn-armor-delete", function(){
  var armorId = $(this).data("armor_id");
  var armorName = $(this).data("armor_name");
  $("#armor-delete-confirm form").attr("action", "/armor/destroy/" + armorId);
  $("#armor-delete-confirm #armor-delete-confirm-name").text(armorName);
});