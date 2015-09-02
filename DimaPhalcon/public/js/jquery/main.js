'use strict';
$( document ).ready( function ()
{    
    var d = D$(),
        MAIN = d.main,
        TABS = d.tabs,
        ORDER = d.order;
    
    // split monitor
    if (undefined === localStorage.split) {
        localStorage.split = '60em';
    }
    $('#left-component').css('width', localStorage.split);
    $('#divider, #right-component').css('left', localStorage.split);
    $('div.split-pane').splitPane();
    $('#divider').on('mouseleave', function(){
        localStorage.split = $('#divider').css('left');
    });
    
    
    /*----PREFERENCES_START----*/
    
    // handlers
    // cog spin on-off
    $('#preferences')
        .mouseover(function(){
            $('.fa-cog').addClass('fa-spin');
        })
        .mouseleave(function(){
            $('.fa-cog').removeClass('fa-spin');
        })
        .click(function(){
            TABS.loadPreferences();
            TABS.changeActiveTab('', '');
        });

    // add new category
    $('#addCategoryBtn').on('click', function(){
        var newCategoryName = $('#addCategoryInput' ).val();
        ('' !== newCategoryName) ? TABS.addCategory(newCategoryName) : 0;
    });
        
    /*----PREFERENCES_END----*/

    /*----NEW_TAB_START----*/
    
    // creating new tab clicking on +
    $('#addNewTab').on('click', function(){
        TABS.getLastLeftTab();
    });
    
    /*----NEW_TAB_END----*/

    /*----INSIDE TAB START----*/
    /* add rows to table */
    $('body').on('click', app.product.dom.addNewRow, function(){
        var numbersOfRows = $( app.product.dom.duration ).val(),
            tableContent = {},
            temp,
            alwaysInTable,
            arr = [],
            max = 0,
            i;
        if (0 === $(app.product.dom.sortable + ' li').size()) {
            for (i = 0; i < numbersOfRows; i++) {
                temp = _.clone(app.product.temp);
                temp['%ROW_NUMBER%'] = 'A' + (i+1);
                temp['%DATA_CELL%'] = 'A' + (i+1);
                tableContent[i] = temp;
            }
            alwaysInTable = app.product.getTableContent(app.product.dom.alw + ' li');
            app.product.createTable(tableContent, alwaysInTable);
        } else {
            $.each($(app.product.dom.sortable + ' .rowNumber'), function(key, val) {
                ('' !== $(val).text()) ? arr.push(parseInt($(val).text().substring(1))) : 0;
            });
            (0 !== arr.length) ? max = Math.max.apply(Math, arr) : 0;

            tableContent = app.product.getTableContent(app.product.dom.sortable + ' li');
            for (var i = 0; i < numbersOfRows; i++) {
                temp = _.clone(app.product.temp);
                temp['%ROW_NUMBER%'] = 'A' + (max+1);
                temp['%DATA_CELL%'] = 'A' + (max+1);
                tableContent[max] = temp;
                max++;
            }
            alwaysInTable = app.product.getTableContent(app.product.dom.alw + ' li');
            app.product.createTable(tableContent, alwaysInTable);
        }
    });

    /* remove tr */
    $('body').on('click', app.product.dom.removeRow, function(){
        var rowName = $(this ).parent().find(app.product.dom.rowValueInput ).attr('data-cell');
        var checkBinding = $('.list-group-item').find('.glyphicon:contains(' + rowName + ')');
        checkBinding.length ? checkBinding.remove() : 0 ;
        $(this ).parent().hide('drop' );
        $(this ).parent().find('.rowNumber' ).text('');
        $(this ).parent().find('.rowValueInput' ).attr('data-cell', '');
        setTimeout(function() { $(this ).parent().remove() }, 500);
    });

    /* SAVE CHANGES IN TABLE */
    $('body').on('mousewheel', '.rowValueInput', function(e) {
        var thisVal = Number($(this ).val());
        if (1 === e.deltaY) {
            $(this ).val((thisVal + 0.01).toFixed(2)).attr('value', (thisVal + 0.01).toFixed(2));
        } else if (-1 === e.deltaY) {
            $(this ).val((thisVal - 0.01).toFixed(2) ).attr('value', (thisVal - 0.01).toFixed(2));
        }
        $( '#calx' ).calx();
        app.product.saveTable();
    });

    $('body').on('keyup', '.rowNameInput', function(){
        $(this ).attr('value', $(this ).val());
        app.product.saveTable();
    });
    
    $('body').on('keydown', '.rowValueInput', function(e){
           switch (e.keyCode) {
               case 38: // UP
                app.product.catchKey(this, '+', 1);
                e.preventDefault();
                break; 
               case 40: // DOWN
                app.product.catchKey(this, '-', 1);
                e.preventDefault();
                break;
               case 191: // /
                app.product.catchKey(this, '+', 10);
                e.preventDefault();
                break;
               case 17: // Ctrl
                app.product.catchKey(this, '-', 10);
                e.preventDefault();
                break;
               case 190: // >
                app.product.catchKey(this, '+', 100);              
                e.preventDefault();
                break;
               case 18: // Alt
                app.product.catchKey(this, '-', 100);
                e.preventDefault();
                break;
               case 32: // Space
                e.preventDefault();
                break;    
           } 
    });

    $('body').on('keyup', '.rowValueInput', function(e){console.log(e.keyCode);
        var notToReact = [17,18,32,37,38,39,40,110,188,190,191 ],
            text = $(this ).val(),
            caretPos;
        if(text.indexOf(',') !== -1) {
           text = text.replace(',','.');
           $(this ).val(text);
        }        
        $(this).attr('value', text);
         if (-1 === $.inArray(e.keyCode, notToReact)){
            caretPos = this.selectionStart;
            if (96 === e.keyCode && '.' === text.charAt((text.length - 2))) {
                
            } else {
                $( '#calx' ).calx();
            text = '' + $(this ).val();
            $(this ).caret(caretPos);
            ('.' === text.charAt((text.length - 2))) ? $(this ).caret((text.length - 1)) : 0;
             app.product.saveTable();
            }
            
        }
    });
    /* SAVE CHANGES IN TABLE END*/

    /* EDIT & SAVE CATEGORIES LIST CONTENT */
    $('body').on('mouseover', '.blockNameAndCat', function(){
        $('#editCategoriesListContent' ).show();
    });
    $('body').on('mouseleave', '.blockNameAndCat', function(){
        $('#editCategoriesListContent' ).css('display', 'none');
    });
    $('body').on('mouseover', '.tableContent', function(){
        $('#editTableContent' ).show();
    });
    $('body').on('mouseleave', '.tableContent', function(){
        $('#editTableContent' ).css('display', 'none');
    });
    // set tab name
     $('body').on('change, keyup', '.nameOfProduct', function(){
         $(app.tabs.dom.curTabName).text($(this ).val());
         ('' === $(this ).val()) ? $(app.tabs.dom.curTabName).text('Новое изделие') : 0;
     });
    $('body').on('change', '.listOfKim', function(){
        var kim = $('option:selected', this ).attr('kim');
        $('[data-cell="KIM1"]' ).val(kim);
        $( '#calx' ).calx();
    });
    $('body').on('change', '.listOfMetalls', function(){
        var metall = $('option:selected', this ).attr('metall');
        var metallOut = $('.listOfMetalls option:selected' ).attr('metallOut');
        $('[data-cell="PR1"]' ).val(metall);
        $('[data-cell="PR2"]' ).val(metallOut);
        $( '#calx' ).calx();
    });
    $('body').on('click', '#editCategoriesListContent', function(){
        $(this ).attr('class', 'glyphicon glyphicon-floppy-disk' ).attr('id', 'saveCategoriesListContent');
        $('.nameOfProduct, .listOfCategories, .listOfKim, .listOfMetalls' ).prop('disabled', false );
    });
    $('body').on('click', '#saveCategoriesListContent', function(){
        $(this ).attr('class', 'glyphicon glyphicon-pencil leftTable').attr('id', 'editCategoriesListContent');
        $('.nameOfProduct, .listOfCategories, .listOfKim, .listOfMetalls' ).prop('disabled', true );
        var prName = $('.nameOfProduct' ).val(),
            categoryId = $('.listOfCategories option:selected' ).attr('name' ),
            kimId = $('.listOfKim option:selected' ).attr('name' ),
            metallId = $('.listOfMetalls option:selected' ).attr('name');
        if ('' === prName) {
            prName = 'Новое изделие';
            $(app.tabs.curTabName).text('Новое изделие');
        }
        app.tabs.changeTabName(prName, categoryId, kimId, metallId);
        app.product.saveTable();
    });

    /* edit & save TableContent */
    $('body').on('click', '#editTableContent', function(){
        $(this ).attr('class', 'glyphicon glyphicon-floppy-disk' ).attr('id', 'saveTableContent');
        $('.removeRow' ).show();
        $( app.product.dom.sortable ).sortable({
            revert: true
        });
        $( app.product.dom.sortable ).sortable("enable");
        //$( "ul, li" ).disableSelection();
    });
    $('body').on('click', '#saveTableContent', function(){
        $(this ).attr('class', 'glyphicon glyphicon-pencil leftTable').attr('id', 'editTableContent');
        $('.removeRow' ).hide();
        app.product.saveTable();
        $( app.product.dom.sortable ).sortable({
            revert: false
        });
        $(app.product.dom.sortable).sortable('disable');
    });

    /* create formula */
    var currentCaretPos = 0;
    $('body').on('click', '#addFormulaInputPr', function(){
        var caretPos = caretPositionInFormulaInput();
        console.log(caretPos());
        $('.removeFhBtn').hide();
        $('#addFormulaInputPr' ).css('border-color', 'rgba(82, 168, 236, 0.8)');
        $('#formulasHelper' ).show('scale');
        if ('auto' === $('body').css('cursor')) {
            $('body').css('cursor', 'pointer');
            $(document).keydown(function (e) {
                if (!$('#addFormulaInputPr').is(":focus")  && 'pointer' === $('body').css('cursor')) {
                    if (e.keyCode === 8) {
                        var currentVal =  $('#addFormulaInputPr').val();
                        currentVal = removeChar(currentVal, currentCaretPos - 1);
                        $('#addFormulaInputPr').val(currentVal);
                        currentCaretPos--;
                        e.preventDefault();
                    }
                }
            });
            $('body').on('keypress',function(e) {
                if (!$('#addFormulaInputPr').is(":focus") && 'pointer' === $('body').css('cursor')) {
                    if (32 !== e.keyCode) {
                        addWhereCaret(currentCaretPos, String.fromCharCode(e.keyCode));
                        currentCaretPos++;
                    }
                }
            });
            $('body').on('click', '.rowNumber', function(){
                addWhereCaret(currentCaretPos, $(this ).text());
                currentCaretPos = currentCaretPos + $(this ).text().length;
            });
        }
    });
    $('body').on('keydown', '#addFormulaInputPr', function(e){
        if (32 === e.keyCode) {
            return false;
        }
    });
    
    $('body').on('mouseleave', '#addFormulaInputPr', function(){
        var caretPos = caretPositionInFormulaInput();
        currentCaretPos = caretPos();
    });
    /* add formulas helper to formula input */
    $('body').on('click', '.fhBtn', function(){
        var caretPos = caretPositionInFormulaInput();
        addWhereCaret(caretPos(), $(this ).text());
    });
    /* show remove formulas helper */
    $('body').on('mouseover', '.fhBtn', function() {
        $( '.removeFhBtn', this).show('fast');
    });
    /* hide remove formulas helper */
    $('body').on('mouseleave', '.fhBtn', function() {
        $( '.removeFhBtn', this).hide('fast');
    });
    /* remove formulas helper*/
    $('body').on('click', app.product.dom.removeFhBtn, function(e) {
        e.stopPropagation();
        e.preventDefault();
        var fhText = $(this ).parent().text();
        app.product.removeFormulasHelper(this, fhText);
        $(this ).parent().fadeOut('slow');
    });
    $('body').on('click', '#cancelFormulaBtnPr', function(){
        cancelInputFotmula();
    });
    $('body').on('click', app.product.dom.addFormulaBtnPr, function(){
        if ('' !== app.product.formulaInputValue) {
            $( app.product.dom.formulasList )
                    .append('<li class="list-group-item formula"><span class="formulaValue">'
                    + $( app.product.dom.addFormulaInputPr ).val() + '</span></li>');
            cancelInputFotmula();
            $( app.product.dom.addFormulaInputPr ).val('');
            app.product.addNewFormula(app.product.getFormulasList);
        }
    });
    $('body').on('click', '.addNewFhBtn', function(){
        $('body').css('cursor', 'pointer');
        var newFl = $('#addNewFhBtnInput' ).val();
        app.product.addBtnToFormulasHelper(newFl);
    });
    $('body').on('click', '#addNewFhBtnInput', function(){
        $('#addFormulaInputPr, .rowNumber').off('click');
        $('body').off('keypress');
        $('body').off('click', '.rowNumber');
        $('body').css('cursor', 'auto');
    });

    $('body').on('mouseover', '.list-group-item', function(){
        $(this ).addClass('list-group-item-info');
    });
    $('body').on('mouseleave', '.list-group-item', function(){
        $(this ).removeClass('list-group-item-info');
    });
    $(function(){
        var self;
        var formula;
        var cell;
        $('body').on('click', '.list-group-item', function(){
            $('#formulasList li' ).removeClass('list-group-item-success');
            cancelInputFotmula();
            self = this;
            formula = $('.formulaValue', self ).text();
            $(self ).toggleClass('list-group-item-success');
        });
        $('body').on('mouseover', '.rowValue', function() {
            if (undefined !== self) {
                if ( -1 === formula.search($( '.rowValueInput', this ).attr( 'data-cell' ))) {
                    if (app.product.checkInputOnFormula(formula, $( '.rowValueInput', this ).attr( 'data-cell' ))) {
                        $('.rowValueInput', this).css(
                                {
                                    'background': 'hsl(145, 38%, 53%)',
                                    'cursor': 'pointer'
                                });
                    } else {
                        $('.rowValueInput', this).prop('disabled', true);
                    }                   
                } else {
                    $('.rowValueInput', this).prop('disabled', true);
                }
            }
            
        });
        $('body').on('mouseleave', '.rowValue', function() {
            $('.rowValueInput', this).css('background', '').prop('disabled', false);
        });

        $('body').on('click', '.rowValueInput', function(){
            if (undefined !== self && false === $(this ).prop('disabled'))
            {
                if (app.product.checkInputOnFormula(formula, $( this ).attr( 'data-cell' ))) {
                   $( this ).attr( 'data-formula', formula ).blur();
                    cell = $( this ).attr( 'data-cell' );
                    $( '#calx' ).calx();
                    $( self ).find('.glyphicon-retweet' ).remove();
                    $( self ).append( '<span class="glyphicon glyphicon-retweet cellBind" aria-hidden="true"> ' + cell + '</span>' );
                    $( self ).removeClass( 'list-group-item-success' );
                    $(this).css('background', '');
                    self = undefined;
                    app.product.addNewFormula(app.product.getFormulasList, true);
                }                
            }
        });
    });

    $('body').on('mouseover', '.glyphicon-retweet', function(){
        $(this ).removeClass('glyphicon glyphicon-retweet' ).addClass('glyphicon glyphicon-resize-full');
    });
    $('body').on('mouseleave', '.glyphicon-resize-full', function(){
        $(this ).removeClass('glyphicon glyphicon-resize-full' ).addClass('glyphicon glyphicon-retweet');
    });
    $('body').on('click', '.glyphicon-resize-full', function(e){
        e.stopPropagation();
        e.preventDefault();
        var bindCell = $(this ).text();
        $('.rowValueInput[data-cell=' +bindCell + ']' )
                .removeAttr('color' ).val('' )
                .attr('value', '')
                .attr('data-formula', '')
                .css('color', '' );
        $('.rowValueInput[data-cell=' +bindCell + ']' ).parent().parent().find('.rowNameInput').css('color', '' );
        $('.rowValueInput[data-cell=' +bindCell + ']' ).parent().parent().css({'background' : '', 'color' : ''});
        $(this ).parent().removeClass('list-group-item-info');
        $(this ).remove();
        $( '#calx' ).calx();
        app.product.addNewFormula(app.product.getFormulasList, false);
        var tableContent = app.product.getTableContent(app.product.dom.sortable + ' li');
        var alwaysInTable = app.product.getTableContent(app.product.dom.alw + ' li');
        app.product.createTable(tableContent, alwaysInTable);
    });

    //RIGHT PART
    $('#kim').on('click', function(){
        app.kim.getKIMTable();
        app.metalls.getMetallsTable();
    });

    $('body').on('click', '#addKIM', function(){
        var kim = $('#kimInput' ).val(),
            kimHardInput = $('#kimHardInput' ).val();
        kim = app.kim.validation(kim);
        app.kim.addKIMtoTable(kim, kimHardInput);
    });
    $('body').on('click', '.editKimPencil', function(){
        $(this )
            .attr('class', 'glyphicon glyphicon-floppy-disk saveEditKim' )
            .css('margin-left', '0');
        $(this )
            .parents('tr')
            .find('.kimHardName, .kimName')
            .attr('contenteditable', 'true')
            .css({
                'border': '1px solid hsl(195, 79%, 43%)',
                'border-radius': '2px'
            });
    });
    $('body').on('click', '.saveEditKim', function(){
        var kimId = $(this ).attr('name'),
            kim = app.fn.inputValidator($(this ).parents('tr').find('.kimName' ).text()),
            kimHard = $(this ).parents('tr').find('.kimHardName' ).text(),
            self = this;
        app.kim.editKim(kimId, kim, kimHard, self);
    });

    $('body').on('click', '.removeKim', function(){
        var kimId = $(this ).attr('name');
        app.kim.removeKim(kimId);
    });

} );
