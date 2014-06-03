
// Show role description when role is selected
$("#user-role")
.selectpicker({
  style : "btn-default",
  width : "100%"
})
.on("change", function(){
  var value = $(this).val();
  var $option = $(this).find("option[value='" + value + "']");
  $option.attr("selected", true);
  var description = $option.data("description") || "no description";
  description = "<strong>" + $option.text() + ":</strong> " + description;
  $("#role-description").html(description);
}).trigger("change");