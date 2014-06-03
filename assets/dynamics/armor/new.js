
// change maxLevel depending on rarity
$("#armor-rarity").on("change", function(){
  var value = $(this).val();
  var $option = $(this).find("option[value='" + value + "']");
  $option.attr("selected", true);
  $("#armor-maxlevel").val($option.data("maxlevel"));
}).trigger("change");