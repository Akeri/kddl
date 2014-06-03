(function ($, w, undefined) {
    if (w.footable === undefined || w.footable === null)
        throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');

    var defaults = {
        filter: {
            enabled: true,
            input: '.footable-filter',
            timeout: 300,
            minimum: 2,
            disableEnter: false,
            filterFunction: function(index) {
                var $t = $(this),
                    $table = $t.parents('table:first'),
                    filter = $table.data('current-filter').toUpperCase(),
                    text = $t.find('td').text();
                if (!$table.data('filter-text-only')) {
                    $t.find('td[data-value]').each(function () {
                        text += $(this).data('value');
                    });
                }
                return text.toUpperCase().indexOf(filter) >= 0;
            }
        }
    };

    function Filter() {
        var p = this;
        p.name = 'Footable Filter';
        p.init = function (ft) {
            p.footable = ft;
            if (ft.options.filter.enabled === true) {
                if ($(ft.table).data('filter') === false) return;
                ft.timers.register('filter');
                $(ft.table)
                    .unbind('.filtering')
                    .bind({
                        'footable_initialized.filtering': function (e) {
                            var $table = $(ft.table);
                            var data = {
                                'input': $table.data('filter') || ft.options.filter.input,
                                'timeout': $table.data('filter-timeout') || ft.options.filter.timeout,
                                'minimum': $table.data('filter-minimum') || ft.options.filter.minimum,
                                'disableEnter': $table.data('filter-disable-enter') || ft.options.filter.disableEnter
                            };
                            if (data.disableEnter) {
                                $(data.input).keypress(function (event) {
                                    if (window.event)
                                        return (window.event.keyCode !== 13);
                                    else
                                        return (event.which !== 13);
                                });
                            }
                            $table.bind('footable_clear_filter', function () {
                                $(data.input).val('');
                                p.clearFilter();
                            });
                            $table.bind('footable_filter', function (event, args) {
                                p.filter(args.filter);
                            });
                            $(data.input).keyup(function (eve) {
                                ft.timers.filter.stop();
                                if (eve.which === 27) {
                                    $(data.input).val('');
                                }
                                ft.timers.filter.start(function () {
                                    var val = $(data.input).val() || '';
                                    p.filter(val);
                                }, data.timeout);
                            });
                        },
                        'footable_redrawn.filtering': function (e) {
                            var $table = $(ft.table),
                                filter = $table.data('filter-string');
                            if (filter) {
                                p.filter(filter);
                            }
                        }
                })
                //save the filter object onto the table so we can access it later
                .data('footable-filter', p);
            }
        };
        
        function addFilterToRow(tr, filterKey){
          var $tr = $(tr);
          var filters = $tr.data("filters");
          if (!filters){
            filters = {};
            $tr.data("filters", filters);
          }
          filters[filterKey] = true;
        }
        
        function removeFilterFromRow(tr, filterKey){
          var $tr = $(tr);
          var filters = $tr.data("filters");
          if (!filters) return true;
          delete filters[filterKey];
          return $.isEmptyObject(filters);
        }
        
        function removeFilterByKey(filterKey){
          p.getAllRows().each(function(){
            removeFilterFromRow(this, filterKey);
          });
        }
        
        function removeAllFilters(){
          p.getAllRows().each(function(){
            $(this).removeData("filters");
          });
        }
        
        p.getAllRows = function(){
          return $(p.footable.table).find('> tbody > tr:not(.footable-row-detail)');
        };

        p.filter = function (filterString, filterKeyArg) {
            var ft = p.footable,
                $table = $(ft.table),
                minimum = $table.data('filter-minimum') || ft.options.filter.minimum,
                clear = !filterString,
                filterKey = filterKeyArg || "mixed";

            //raise a pre-filter event so that we can cancel the filtering if needed
            var event = ft.raise('footable_filtering', { filter: filterString, clear: clear });
            if (event && event.result === false) return;
            if (event.filter && (!$.isArray(event.filter) && event.filter.length < minimum)) {
              return; //if we do not have the minimum chars then do nothing
            }

          var $rows = p.getAllRows();
          $table.find('> tbody > tr').hide().addClass('footable-filtered');
          if (!event.clear){
            var filters = $.type(event.filter) == "string" ? event.filter.split(' ') : [event.filter];
            $.each(filters, function(i, f){
              if (f && f.length > 0){
                $table.data('current-filter', f);
                $rows = $rows.filter(ft.options.filter.filterFunction);
              }
            });
          }
          $rows.each(function(){
            if (!removeFilterFromRow(this, filterKey)) return;
            p.showRow(this, ft);
            $(this).removeClass('footable-filtered');
          });
          p.getAllRows().not($rows).each(function(){
            addFilterToRow(this, filterKey);
          });
          $table.data('filter-string', event.filter);
          ft.raise('footable_filtered', { filter: event.filter, clear: false });
      };
        
        p.filterByColumn = function(filterObj){
          var ft = p.footable;
//          var $table = $(ft.table);
          var prevFilterFn = ft.options.filter.filterFunction;
          var fn = function(columnIndex, fnCompare){
            var $t = $(this),
            $table = $t.parents('table:first'),
            filter = $table.data('current-filter');
            var $td = $t.find('td:eq(' + columnIndex + ')');
            var text = $td.text();
            if (!$table.data('filter-text-only')) {
              $t.find('td:eq(' + columnIndex + ')[data-value]').each(function () {
                text += $(this).data('value');
              });
            }
            return fnCompare(text, filter, $td);
          };
          $.each(filterObj, function(columnIndex, term){
            var filterKey = columnIndex.toString();
            var termString = term;
            var fnCompare = function(subject, term, $cell){
              return subject.toUpperCase().indexOf(term.toUpperCase()) >= 0;
            };
            if ($.isPlainObject(term)){
              if (term.key) filterKey = term.key;
              if (term.term !== undefined) termString = term.term;
              if ($.isFunction(term.compare)) fnCompare = term.compare;
            }
            ft.options.filter.filterFunction = function(index){
              return fn.apply(this, [columnIndex, fnCompare]);
            };
            p.filter(termString, filterKey);
//            $table.trigger("footable_filter", {filter : termString});
          });
          ft.options.filter.filterFunction = prevFilterFn;
        };
        
        p.clearFilter = function () {
            removeAllFilters();
            var ft = p.footable,
                $table = $(ft.table);

            p.getAllRows().removeClass('footable-filtered').each(function(){
              p.showRow(this, ft);
            });
            $table.removeData('filter-string');
            ft.raise('footable_filtered', { clear: true });
        };

        p.showRow = function (row, ft) {
            var $row = $(row), $next = $row.next(), $table = $(ft.table);
            if ($row.is(':visible')) return; //already visible - do nothing
            if ($table.hasClass('breakpoint') && $row.hasClass('footable-detail-show') && $next.hasClass('footable-row-detail')) {
                $row.add($next).show();
                ft.createOrUpdateDetailRow(row);
            }
            else $row.show();
        };
    }

    w.footable.plugins.register(Filter, defaults);

})(jQuery, window);