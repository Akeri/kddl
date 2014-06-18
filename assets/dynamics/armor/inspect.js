
function restart(){
  $("#start-inspecting").show();
  $("#stop-inspecting").hide();
  $("#restart-inspecting").hide();
  $("#new-results-container").empty();
  $("#updated-results-container").empty();
  $("#new-results-counter").text("0");
  $("#updated-results-counter").text("0");
  $("#wikia-uri").attr("disabled", false);
  $(".shown-while-crawling").hide();
  $(".hidden-while-crawling").show();
}

function startInspecting(){
  var uri = $("#wikia-uri").val();
  if (!uri.length) return $("#dialog-missing-addr").modal("show");
  $("#wikia-uri").attr("disabled", true);
  $("#start-inspecting").hide();
  $("#stop-inspecting").attr("disabled", false).show();
  $(".hidden-while-crawling").hide();
  $(".shown-while-crawling").show();
  $(".inspect-not-in-progress").hide();
  $(".inspect-in-progress").show();
  socket.request("/armor/inspectStart?page=" + uri);
}

function stopInspecting(){
  $("#stop-inspecting").attr("disabled", true);
  socket.request("/armor/inspectStop");
}

function errorInspecting(){
  $("#dialog-error-inspecting").modal("show");
  inspectFinished();
}

function inspectFinished(){
  $(".inspect-in-progress").hide();
  $(".inspect-not-in-progress").show();
  $("#stop-inspecting").attr("disabled", true);
  $("#restart-inspecting").show();
  $("#dialog-finished-inspecting").modal("show");
}

function gotNewArmor(armor){
  console.log("Found armor", armor);
  var $container = $("#new-results-container");
  var $templ = $(".armor-item-templ")
    .clone()
    .removeClass("armor-item-templ")
    .prependTo($container);
  $templ.find(".armor-name").html(
    "<a style='white-space:nowrap;' href='/armor/show/" + armor.id + "'>" + armor.name + "</a>");
  var picPath = armor.mainPic || "/linker/images/question_shield.png";
  $templ.find(".armor-mainpic").css("background-image", "url('" + picPath + "')");
  $("#new-results-counter").text($container.find("li").size());
  $templ.show();
}

function updatedArmor(data){
  var armor = data.armor;
  console.log("Updated armor", armor);
  var $container = $("#updated-results-container");
  var $templ = $(".armor-item-templ")
    .clone()
    .removeClass("armor-item-templ")
    .prependTo($container);
  $templ.find(".armor-name").html(
    "<a style='white-space:nowrap;' href='/armor/show/" + armor.id + "'>" + armor.name + "</a>");
  var picPath = armor.mainPic || "/linker/images/question_shield.png";
  $templ.find(".armor-mainpic").css("background-image", "url('" + picPath + "')");
  $("#updated-results-counter").text($container.find("li").size());
  $templ.show();
}

$("#start-inspecting").on("click", startInspecting);
$("#stop-inspecting").on("click", stopInspecting);
$("#restart-inspecting").on("click", restart);
socket.on("inspectEnd", inspectFinished);
socket.on("inspectError", errorInspecting);
socket.on("newArmor", gotNewArmor);
socket.on("updateArmor", updatedArmor);

restart();