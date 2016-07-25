var PoC = PoC || {};

PoC['Filters'] = [];

PoC.applyRefiners = function(control) {
    var ref = {};
    $.each(PoC.Filters, function(idx, value) {
        var parent = $('div[refinername="' + value + '"]');
        var selected = parent.find('input[type="checkbox"]:checked');
        if (selected.length > 0) {
            ref[value] = $.map(selected, function(v, i) {
                return $(v).val();
            });
        }
    });

//This is for single refiner 
    //var token = $('input[data-displayvalue="Initiate"]').val();
    //var token2 = $('input[data-displayvalue="Consumer"]').val();
    //var token3 = $('input[data-displayvalue="pdf"]').val();
    //console.log(control);

    //var refiners = [];
    //Srch.U.appendArray(refiners, token);
    //control.updateRefinementFilters(name, refiners, 'or', false, null);
//End single refiner

    //var ref = {};
    //ref['RefinableString00'] = [token];
    //ref['RefinableString01'] = [token2];
    //ref['FileType'] = [token3];
    //control.updateRefiners(ref, 'or', false, null);

//TODO: compare current selected refiners and new selection. if un-selected any existing refiner
//      needs to call removeRefinementFilter function
    //var token = $('input[data-displayvalue="Initiate"]').val();
    //var removed = {};
    //removed['RefinableString00'] = [token];


    var removed = {};
    var current = PoC.getCurrentAppliedRefiners(control);
    $.each(current, function(idx, val) {
        var propName = val.n;
        if (!ref.hasOwnProperty(propName)) {
            removed[propName] = val.t;
        } else {
            var currFilter = val.t;
            var newFilters = ref[propName];
            var tmp = [];

            $.grep(currFilter, function(el) {
                if ($.inArray(el, newFilters) == -1) 
                    tmp.push(el);
            });

            if (tmp.length > 0)
                removed[propName] = tmp;
        }
    });

    console.log(removed);
    console.log(ref);

    control.removeRefinementFilters(removed);
    control.updateRefiners(ref, 'or', false, null);
}

PoC.clearRefiners = function(control) {
    var ref = {};
    $.each(PoC.Filters, function(idx, val) {
        ref[val] = [];
    });

    control.updateRefiners(ref, 'or', false, null);
}

PoC.set_Filter = function(name) {
    var exists = false;
    $.each(PoC.Filters, function(index, value) {
        if (value === name) {
            exists = true;
        }
    });

    if (!exists)
        PoC.Filters.push(name);
}

PoC.getCurrentAppliedRefiners = function(cc) {
    var currentRefinement = [];
    // Check if client control is not null
    if (!Srch.U.n(cc)) {
        // Retrieve the current refiners
        var refiners = cc.get_dataProvider().get_currentQueryState().r;
        // Check there is refinement in place
        if (!Srch.U.n(refiners) && refiners.length > 0) {
            for (var i = 0; i < refiners.length; i++) {
                var refVal = refiners[i];
                if (!Srch.U.n(refVal)) {
                    Srch.U.appendArray(currentRefinement, refVal);
                }
            }
        }
    }
    return currentRefinement;
}

Srch.RefinementCategory.prototype.toString = function () {
    var refinementFilter = '';
    if (Srch.U.n(this.t) || !this.t.length) {
        return refinementFilter;
    }
    if (this.t.length > 0) {
        if (this.t.length === 1) {
            // Check for special case where we send in FQL as the key, and the length of the query is 1
            if (this.n === "FQL") {
                refinementFilter = this.t[0];
            } else {
                refinementFilter = this.n + ':' + this.t[0];
            }
        } else {
            var operator = (Srch.U.e(this.o)) ? 'and' : this.o;
            var useKQL = !Srch.U.n(this.k) && this.k;
            if (useKQL) {
                if (this.t.length > 1) {
                    refinementFilter += '(';
                }
                for (var i = 0; i < this.t.length; i++) {
                    refinementFilter += this.n + ':' + this.t[i];
                    if (i < this.t.length - 1) {
                        refinementFilter += ' ' + operator + ' ';
                    }
                }
                if (this.t.length > 1) {
                    refinementFilter += ')';
                }
            } else {
                refinementFilter = this.n + ':' + operator + '(' + this.t.join(',') + ')';
            }
        }
    }
    return refinementFilter;
}