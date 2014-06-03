
// Init guild rank selectpicker
var $rankSelector = $("#player-guild-rank")
.selectpicker({
  style : "btn-default",
  width : "100%"
}).trigger("change");

// Init guild selectpicker
$("#player-guild")
.selectpicker({
  style : "btn-default",
  width : "100%"
}).on("change", function(){
  if ($(this).val() == "null"){
    $rankSelector
    .selectpicker("val", "null")
    .prop("disabled", true)
    .selectpicker("refresh");
  }else{
    $rankSelector
    .prop("disabled", false)
    .selectpicker("refresh");
  }
}).trigger("change");

// Init main player switch
$("#player-main").bootstrapSwitch({
  state     : false,
  onText    : "Yup",
  offText   : "No",
  size      : "normal"
});