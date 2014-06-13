$.extend(true, $.fn.wysihtml5.defaultOptions, {
  html  : true,
  color : true,
  size  : "sm",
  customTemplates : {
    html : function(args){
      return "<li>" +
        	   "<div class='btn-group'>" +
        	     "<a class='btn btn-default btn-" + args.options.size + "' data-wysihtml5-action='change_view' title='" + args.locale.html.edit + "' tabindex='-1'>" +
        	       "<i class='fa fa-code'></i>" +
        	     "</a>" +
        	   "</div>" +
      	     "</li>";
    }
  }
});