;(function(global, $) {
    
    // 'new' an object
    var Dima = function(firstName, lastName, language) {
        return new Dima.init(firstName, lastName, language);   
    };

    // url's
    var URL = {
        BASE: 'http://DimaPhalcon/DimaPhalcon/',
        TABS: 'tabs/',
        CATEG: 'categories/',
        ORDER: 'order/',
        KIM: 'kim/',
        METALLS: 'metalls/',
        PRODUCT: 'products/',
	LOCATION: 'http://DimaPhalcon/DimaPhalcon/'
    };

    var URL_TABS = URL.BASE + URL.TABS;

    var URL_CATEG = URL.BASE + URL.CATEG;

    var URL_ORDER = URL.BASE + URL.ORDER;
    
    var URL_KIM = URL.BASE + URL.KIM;
    
    var URL_METALLS = URL.BASE + URL.METALLS;
    
    var URL_PRODUCT = URL.BASE + URL.PRODUCT;
    
    var LOCATION = URL.LOCATION;

    // alias to this Class
    var SELF;

    // alias to self.main
    var MAIN;

    // alias to self.tabs
    var TABS;

    // alias to self.product
    var PRODUCT;

    // alias to self.order
    var ORDER;
    
    // alias to self.kim
    var KIM;
    
    // alias to self.metalls
    var METALLS;

    // alias to self.menu
    var MENU;
    
    function run() {
        TABS.getLeftTabsList();
        TABS.getRightTabsList();
    }
    
    var orderPlaceholder = {
        "%FIO%": "",
        "%PROJECT_NAME%": "",
        "%APPEAL%": "",
        "%PROJECT_DESCR%": "",
        "%COMPANY_NAME%": "",
        "%ADDRES%": "",
        "%ACC_NUMBER%": "",
        "%CITY%": "",
        "%ESTIMATE%": "",
        "%DATE%": ""
    };   
    
    var tempTable = {
        "%ROW_NUMBER%": "",
        "%ROW_NAME%": "",
        "%DATA_CELL%": "",
        "%DATA_FORMULA%": "",
        "%INPUT_VALUE%": ""
    };
    
    // logging errors
    function log(php) {
        if('undefined' != typeof(console))
        {
            console.error('ERROR in ' + php);
        }        
    }

    function showBody() {
        if ($('body').is(":visible")) {
            return false;
        }
        $('body' ).fadeIn(350);
        return true;
    }
    
    function kimEditOver(obj, scope) {
        $('.glyphicon-pencil', scope)
            .removeClass(obj.pencilRemove)
            .addClass(obj.pencilAdd);
        $('.glyphicon-remove', scope)
            .removeClass(obj.removeRemove)
            .addClass(obj.removeAdd);
    }
    
    function changeActiveTab(obj) {
        var scope = obj.scope,
            selectedTabId = $(scope ).attr('aria-controls'),
            curTabId = obj.curTabId,
            tabsList = obj.tabsList,
            tabId, prodId, orderId;

        '' !== MAIN[curTabId] ? MAIN[tabsList][MAIN[curTabId]].active = '0' : 0;

        if (MAIN[curTabId] !== selectedTabId && undefined !== selectedTabId){
            tabId = $(scope ).find('.glyphicon-remove' ).attr('name' );
            prodId = $(scope ).attr('name');
            MAIN[tabsList][selectedTabId].active = '1';
            if (obj.hasOwnProperty('order')) {
                orderId = $(scope ).attr('data-order');
                TABS.getRightTabContentOrderDetails(orderId, selectedTabId);
                TABS.getRightTabContentTable(orderId);
            } else {
                TABS[obj.getTabContent](prodId, selectedTabId);
            }
            TABS[obj.changeActiveTab](tabId, selectedTabId, obj.action);
        }
    }
    
    function editDescriptionOfProduct(bool) {
        var obj = {};
        
        $('.nameOfProduct, .listOfCategories, .listOfKim, .listOfMetalls' ).prop('disabled', bool );
        
        if (!bool) {            
            return true;
        }
        
        obj.prName = $('.nameOfProduct' ).val(),
        obj.categoryId = $('.listOfCategories option:selected' ).attr('name' ),
        obj.kimId = $('.listOfKim option:selected' ).attr('name' ),
        obj.metallId = $('.listOfMetalls option:selected' ).attr('name');
        
        return obj;
    }
    function addLeftTabsHandler(html) {

        html
            // change current tab
            .find('[role=tab]').click(function(){
                if ($(this ).attr('aria-controls') !== MAIN.curTabId) {
                    changeActiveTab({
                        scope: this,
                        curTabId: 'curTabId',
                        tabsList: 'tabsList',
                        getTabContent: 'getLeftTabContent',
                        changeActiveTab: 'changeActiveTab',
                        action: 'changeActiveLeftTab'
                    });
                }
            }).end()
        
            //close tab
            .find('.closeTab').click(function (e){
                e.stopPropagation();
                var currentID = $(this).parent().attr('aria-controls' ),
                    idDb = $(this ).attr('name');
                $(this ).attr('class', 'glyphicon glyphicon-remove');
                TABS.closeTabMethod(idDb, currentID);
            });
    }
    
    function addLeftTabContentHandler(html) {
        //console.log(html.find('#addFormulaBtnPr' ));
        html
            // edit & save categories list content
            .filter('.blockNameAndCat')
                .mouseover(function(){
                    $('#editCategoriesListContent' ).show();
                })
                .mouseleave(function(){
                    $('#editCategoriesListContent' ).css('display', 'none');
                } ).end()

            .filter('.tableContent')
                .mouseover(function(){
                    $('#editTableContent' ).show();
                })
                .mouseleave(function(){
                    $('#editTableContent' ).css('display', 'none');
                } ).end()
                
            // edit & save Categories list    
            .on('click', '#editCategoriesListContent', function(){
                $(this ).attr({
                            class: 'glyphicon glyphicon-floppy-disk',
                            id: 'saveCategoriesListContent' 
                        });
                editDescriptionOfProduct(false);
                
            } )            
            
            .on('click', '#saveCategoriesListContent', function(){
                var obj;
                $(this ).attr({
                            class: 'glyphicon glyphicon-pencil leftTable',
                            id: 'editCategoriesListContent'
                        });
                obj = editDescriptionOfProduct(true);
                if ('' === obj.prName) {
                    obj.prName = 'Новое изделие';
                    $(MAIN.curTabName).text('Новое изделие');
                }
                TABS.changeTabName(obj);
                PRODUCT.saveTable();
            })
            
            // edit & save TableContent
            .on('click', '#editTableContent', function(){
                $(this ).attr({
                            class: 'glyphicon glyphicon-floppy-disk',
                            id: 'saveTableContent' 
                        });
                $('.removeRow').show();
                $('#sortable').sortable({
                    revert: true
                });
                $('#sortable').sortable("enable");
                //$( "ul, li" ).disableSelection();
            })
            
            .on('click', '#saveTableContent', function(){
                $(this ).attr({
                            class: 'glyphicon glyphicon-pencil leftTable',
                            id: 'editTableContent' 
                        });
                $('.removeRow' ).hide();
                PRODUCT.saveTable();
                $('#sortable').sortable({
                    revert: false
                });
                $('#sortable').sortable('disable');
            })

            .find('#saveInDB' ).click(function() {
                PRODUCT.saveProductInDB();
            }).end()

            .find('#createOrderBtn').click(function () {
                ORDER.createNewOrder(MAIN.productId);
            }).end()
            
            // change left tab name
            .find('.nameOfProduct').on('change, keyup', function(){
                $(MAIN.curTabName).text($(this ).val());
                ('' === $(this ).val()) ? $(MAIN.curTabName).text('Новое изделие') : 0;
            }).end()

            // change kim in table
            .find('.listOfKim').change(function(){
                var kim = $('option:selected', this ).attr('kim');
                $('[data-cell="KIM1"]' ).val(kim);
                $( '#calx' ).calx();
            }).end()

            // change metall in table
            .find('.listOfMetalls').change(function(){
                var metall = $('option:selected', this ).attr('metall');
                var metallOut = $('.listOfMetalls option:selected' ).attr('metallOut');
                $('[data-cell="PR1"]' ).val(metall);
                $('[data-cell="PR2"]' ).val(metallOut);
                $( '#calx' ).calx();
            }).end()
	    
	        // add new row in product table
            .find('#addNewRow').click(function () {
                var numbersOfRows = $('#duration').val(),
                    tableContent = {},
                    temp,
                    alwaysInTable,
                    arr = [],
                    max = 0,
                    i;
                    
                if (0 === $('#sortable li').size()) {
                    for (i = 0; i < numbersOfRows; i++) {
                        temp = _.clone(tempTable);
                        temp['%ROW_NUMBER%'] = 'A' + (i + 1);
                        temp['%DATA_CELL%'] = 'A' + (i + 1);
                        tableContent[i] = temp;
                    }
                    alwaysInTable = PRODUCT.getTableContent('#alwaysInTable li');
                    PRODUCT.createTable(tableContent, alwaysInTable);
                } else {
                    $.each($('#sortable .rowNumber'), function (key, val) {
                        ('' !== $(val).text()) ? arr.push(parseInt($(val).text().substring(1))) : 0;
                    });
                    (0 !== arr.length) ? max = Math.max.apply(Math, arr) : 0;

                    tableContent = PRODUCT.getTableContent('#sortable li');
                    for (var i = 0; i < numbersOfRows; i++) {
                        temp = _.clone(tempTable);
                        temp['%ROW_NUMBER%'] = 'A' + (max + 1);
                        temp['%DATA_CELL%'] = 'A' + (max + 1);
                        tableContent[max] = temp;
                        max++;
                    }
                    alwaysInTable = PRODUCT.getTableContent('#alwaysInTable li');
                    PRODUCT.createTable(tableContent, alwaysInTable);
                }
            }).end()
	    
	    // remove tr in product table
	    .on('click', '.removeRow', function () {
		var rowName = $(this).parent().find('.rowValueInput').attr('data-cell');
		var checkBinding = $('.list-group-item').find('.glyphicon:contains(' + rowName + ')');
		checkBinding.length ? checkBinding.remove() : 0;
		$(this).parent().hide('drop');
		$(this).parent().find('.rowNumber').text('');
		$(this).parent().find('.rowValueInput').attr('data-cell', '');
		setTimeout(function () {
		    $(this).parent().remove();
		}, 500);
	    })
	    
	    // change row name in product table
	    .on('keyup', '.rowNameInput', function () {
		$(this).attr('value', $(this).val());
		PRODUCT.saveTable();
	    })
	    
	    // change value in product table by mouse wheel
	    .on('mousewheel', '.rowValueInput', function (e) {
		var thisVal = Number($(this).val());
		if (1 === e.deltaY) {
		    $(this).val((thisVal + 0.01).toFixed(2)).attr('value', (thisVal + 0.01).toFixed(2));
		} else if (-1 === e.deltaY) {
		    $(this).val((thisVal - 0.01).toFixed(2)).attr('value', (thisVal - 0.01).toFixed(2));
		}
		$('#calx').calx();
		PRODUCT.saveTable();
	    })
	    
	    // change value in product table by keys
	    .on('keydown', '.rowValueInput', function (e) {
		switch (e.keyCode) {
		    case 38: // UP
		    PRODUCT.catchKey(this, '+', 1);
		    e.preventDefault();
		    break;
		    case 40: // DOWN
		    PRODUCT.catchKey(this, '-', 1);
		    e.preventDefault();
		    break;
		    case 191: // /
		    PRODUCT.catchKey(this, '+', 10);
		    e.preventDefault();
		    break;
		    case 17: // Ctrl
		    PRODUCT.catchKey(this, '-', 10);
		    e.preventDefault();
		    break;
		    case 190: // >
		    PRODUCT.catchKey(this, '+', 100);
		    e.preventDefault();
		    break;
		    case 18: // Alt
		    PRODUCT.catchKey(this, '-', 100);
		    e.preventDefault();
		    break;
		    case 32: // Space
		    e.preventDefault();
		    break;
		}
	    })
	    
	    // prevent space and comma default action
	    .on('keyup', '.rowValueInput', function (e) {
		var notToReact = [17, 18, 32, 37, 38, 39, 40, 110, 188, 190, 191],
		    text = $(this).val(),
		    caretPos;
		if (text.indexOf(',') !== -1) {
		    text = text.replace(',', '.');
		    $(this).val(text);
		}
		$(this).attr('value', text);
		if (-1 === $.inArray(e.keyCode, notToReact)) {
		    caretPos = this.selectionStart;
		    if (96 === e.keyCode && '.' === text.charAt((text.length - 2))) {

		    } else {
		    $('#calx').calx();
		    text = '' + $(this).val();
		    $(this).caret(caretPos);
		    ('.' === text.charAt((text.length - 2))) ? $(this).caret((text.length - 1)) : 0;
		    PRODUCT.saveTable();
		    }
		}
	    })
	    
	    // add new formula
	    .find('#addFormulaBtnPr').click(function(){
		if ('' !== $('#addFormulaInputPr').val()) {
		    $( '#formulasList' )
			    .append('<li class="list-group-item formula"><span class="formulaValue">'
			    + $( '#addFormulaInputPr' ).val() + '</span></li>');
		    PRODUCT.cancelInputFormula();
		    $( '#addFormulaInputPr' ).val('');
		    PRODUCT.addNewFormula(PRODUCT.getFormulasList);
		}
	    }).end()

        // create formula
	    .find('#addFormulaInputPr')
            .click(function(){
                var currentVal, ls;
                $('.removeFhBtn').hide();
                $('#addFormulaInputPr' ).css('border-color', 'rgba(82, 168, 236, 0.8)');
                $('#formulasHelper' ).show('scale');
                $('#addFormulaBtnPr' ).hide();
                $('.formulaBtnGroupPr' ).show('drop');
                if ('auto' === $('body').css('cursor')) {
                    $('body').css('cursor', 'pointer');
                    $(document )
                        .off('keydown')
                        .keydown(function (e) {
                            if (!$('#addFormulaInputPr').is(":focus")  && 'pointer' === $('body').css('cursor')) {
                                if (e.keyCode === 8) {
                                    currentVal =  $('#addFormulaInputPr').val();
                                    ls = localStorage.currentCaretPos;
                                    currentVal = PRODUCT.removeChar(currentVal, ls - 1);
                                    $('#addFormulaInputPr').val(currentVal);
                                    localStorage.currentCaretPos--;
                                    e.preventDefault();
                                }
                            }
                        });
                    $('body')
                        .off('keypress')
                        .keypress(function(e) {
                            if (!$('#addFormulaInputPr').is(":focus") && 'pointer' === $('body').css('cursor')) {
                                if (32 !== e.keyCode) {
                                    PRODUCT.addWhereCaret(localStorage.currentCaretPos, String.fromCharCode(e.keyCode));
                                    localStorage.currentCaretPos++;
                                }
                            }
                        });
                    $('body')
                        .off('keyup')
                        .keyup(function() {
                        PRODUCT.toggleAddFormula();
                    });
                    $('body').on('click', '.rowNumber', function(){
                        PRODUCT.addElementToFormulaInput(this);
                    });
                }
            })
            .keydown(function(e){
                if (32 === e.keyCode) {
                return false;
                }
            })
            .mouseleave(function(){
                localStorage.currentCaretPos = document.getElementById('addFormulaInputPr').selectionStart;
            } ).end()

		//cancel create new formula
        .find('#cancelFormulaBtnPr' ).click(function(){
            PRODUCT.cancelInputFormula();
        } ).end()

        // add formulas helper to formula input
        .on('click', '.fhBtn', function(){
            PRODUCT.addElementToFormulaInput(this);
        })

        // show remove formulas helper
        .on('mouseover', '.fhBtn', function() {
            $( '.removeFhBtn', this).show('fast');
        })

        // hide remove formulas helper
        .on('mouseleave', '.fhBtn', function() {
            $( '.removeFhBtn', this).hide('fast');
        })

        // remove formulas helper
        .on('click', '.removeFhBtn', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var fhText = $(this ).parent().text();
            PRODUCT.removeFormulasHelper(this, fhText);
            $(this ).parent().fadeOut('slow');
        })

        // add new formula helper
        .on('click', '.addNewFhBtn', function(){
            $('body').css('cursor', 'pointer');
            var newFl = $('#addNewFhBtnInput' ).val();
            PRODUCT.addBtnToFormulasHelper(newFl);
        })

        // focus on formula helper input
        .on('click', '#addNewFhBtnInput', function(){
            $('#addFormulaInputPr, .rowNumber').off('click');
            $('body').off('keypress');
            $('body').off('click', '.rowNumber');
            $('body').css('cursor', 'auto');
        })

        .on('mouseover', '.list-group-item', function(){
            $(this ).addClass('list-group-item-info');
        })

        .on('mouseleave', '.list-group-item', function(){
            $(this ).removeClass('list-group-item-info');
        })

        .on('mouseover', '.glyphicon-retweet', function(){
            $(this ).removeClass('glyphicon glyphicon-retweet' ).addClass('glyphicon glyphicon-resize-full');
        })

        .on('mouseleave', '.glyphicon-resize-full', function(){
            $(this ).removeClass('glyphicon glyphicon-resize-full' ).addClass('glyphicon glyphicon-retweet');
        })

        .on('click', '.glyphicon-resize-full', function(e){
            var bindCell = $(this ).text(),
                tableContent, alwaysInTable;
            e.stopPropagation();
            e.preventDefault();

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
            PRODUCT.addNewFormula(PRODUCT.getFormulasList, false);
            tableContent = PRODUCT.getTableContent('#sortable li');
            alwaysInTable = PRODUCT.getTableContent('#alwaysInTable li');
            PRODUCT.createTable(tableContent, alwaysInTable);
        })
        return html;
    }
    
    function addRightTabsHandler(html) {

        html
            .find('[role=tab]').click(function(){
                if ($(this ).attr('aria-controls') !== MAIN.curTabRightId) {
                    changeActiveTab({
                        scope: this,
                        order: true,
                        curTabId: 'curTabRightId',
                        tabsList: 'tabsRightList',
                        getTabContent: 'getRightTabContent',
                        changeActiveTab: 'changeActiveTab',
                        action: 'changeActiveRightTab'
                    });
                }
            });

        return html;
    }
    
    function addRightTabContentOrderHandler(html) {
        //console.log(html.find('#saveOrderInDB'));
        html
            .find('#saveOrderInDB').click(function() {
                ORDER.saveOrderInDB();
            } ).end()
            .find('#checkAllInOrder').click(function () {
                ORDER.checkAllInOrderDetails(true);
            }).end()

            .find('#uncheckAllInOrder').click(function () {
                ORDER.checkAllInOrderDetails(false);
            }).end()
            
            .find('#changeDiscount').click(function () {
                ORDER.changeDiscount({
                    discount: $(this).val(),
                    orderId: MAIN.orderId
                });
            }).end()

            .find('.inputOrderDetails' ).keyup(function() {
                var obj = ORDER.createJSONFromOrderDescription();
                ORDER.changeOrderDetails(
                    {
                        orderId: MAIN.orderId,
                        orderDescr: obj
                    }
                );
            }).end()

            .find('#orderEstimateInput, #orderDateInput').on('keyup, click, change', function() {
                var obj = ORDER.createJSONFromOrderDescription();
                ORDER.changeOrderDetails(
                    {
                        orderId: MAIN.orderId,
                        orderDescr: obj
                    }
                );
            });
        
        return html;
    }

    function addRightTabContentTableHandler(html) {

        html
            .find('#quantityInOrder' ).change(function () {
                var quantity = parseInt($(this).val()),
                    productId = $(this).attr('data-product'),
                    row = $(this).parents('.orderRow'),
                    inPrice, outPrice, inSum, outSum;
                if (0 > quantity) {
                    quantity = 1;
                    $(this).val(quantity);
                }
                inPrice = parseFloat(row.find('.inputPriceInOrder').text());
                outPrice = parseFloat(row.find('.outputPriceInOrder').text());
                inSum = quantity * inPrice;
                outSum = quantity * outPrice;
                row.find('.inputSumInOrder').html(inSum.toFixed(2)).
                    end().
                    find('.outputSumInOrder').html(outSum.toFixed(2));
                ORDER.changeQuantity({
                        orderId: MAIN.orderId,
                        productId: productId,
                        quantity: quantity
                    }
                );
            } ).end()

            .find('#addNewSection' ).click(function() {
                $('#orderTable tbody' ).append('<tr><th colspan="9"><span contenteditable="true">Раздел</span></th></tr>');
            });
        return html;
    }

    function addKimTableHandler(html) {
        //console.log(html.find('.editKimPencil'));
        html
            .filter('tr')
                .mouseover(function () {
                    var obj = {
                        pencilRemove: 'triggerKimPencil',
                        pencilAdd: 'editKimPencil',
                        removeRemove: 'triggerRemoveKim',
                        removeAdd: 'removeKim'
                    };
                    kimEditOver(obj, this);
                })
                .mouseleave(function () {
                    var obj = {
                        pencilRemove: 'editKimPencil',
                        pencilAdd: 'triggerKimPencil',
                        removeRemove: 'removeKim',
                        removeAdd: 'triggerRemoveKim'
                    };
                    kimEditOver(obj, this);
                }).end()
                
            .on('click', '.removeKim', function(){
                var kimId = $(this ).attr('name');;
                KIM.removeKim(kimId);
            })
            
            .on('click', '.editKimPencil', function(){
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
            })
            
            .on('click', '.saveEditKim', function(){
                var kimId = $(this ).attr('name'),
                    kim = KIM.validation($(this ).parents('tr').find('.kimName' ).text()),
                    kimHard = $(this ).parents('tr').find('.kimHardName' ).text(),
                    self = this;
                KIM.editKim(kimId, kim, kimHard, self);
            });
            
        return html;
    }
    
    function addMetallsTableHandler(html) {
        
        html
            .filter('tr')
                .mouseover(function () {
                    var obj = {
                        pencilRemove: 'triggerMetallPencil',
                        pencilAdd: 'editMetallPencil',
                        removeRemove: 'triggerRemoveMetall',
                        removeAdd: 'removeMetall'
                    };
                    kimEditOver(obj, this);
                })
                .mouseleave(function () {
                    var obj = {
                        pencilRemove: 'editMetallPencil',
                        pencilAdd: 'triggerMetallPencil',
                        removeRemove: 'removeMetall',
                        removeAdd: 'triggerRemoveMetall'
                    };
                    kimEditOver(obj, this);
                }).end()
                
            .on('click', '.editMetallPencil', function () {
                $(this)
                        .attr('class', 'glyphicon glyphicon-floppy-disk saveEditMetall')
                        .css('margin-left', '0');
                $(this)
                        .parents('tr')
                        .find('.metallName, .metallPrice, .metallMass, .metallOutPrice')
                        .attr('contenteditable', 'true')
                        .css({
                            'border': '1px solid hsl(195, 79%, 43%)',
                            'border-radius': '2px'
                        });
            })
            
            .on('click', '.saveEditMetall', function(){
                var obj = {
                    metallId: $(this ).attr('name'),
                    metallName: $(this ).parents('tr').find('.metallName' ).text(),
                    metallPrice: KIM.validation($(this ).parents('tr').find('.metallPrice' ).text()),
                    metallMass: KIM.validation($(this ).parents('tr').find('.metallMass' ).text()),
                    metallOutPrice: KIM.validation($(this ).parents('tr').find('.metallOutPrice' ).text())
                };
                var self = this;
                METALLS.editMetall(obj, this);
            })
            .on('click', '.removeMetall', function () {
                var metallId = $(this).attr('name');
                METALLS.removeMetall(metallId);
            });
            
        return html;
    }
    
    // prototype holds methods (to save memory space)
    Dima.prototype = {

        // tabs section
        tabs: {
            getLeftTabsList: function() {
                $.ajax( {
                    url   : URL_TABS + 'getLeftTabsList',
                    method: 'GET'
                } ).then( function ( data )
                {
                    var html;
                    
                    MAIN.tabsList = data.tabsList;
                    MAIN.tableContent = data.kim;
                    
                    if (data.html) {
                        html = $(data.html);
                        addLeftTabsHandler(html);
                        html.insertBefore( '#addNewTab' );
                    }
                    if (data.active && data.html) {
                        TABS.getLeftTabContent(data.productId, data.active);
                    } else {
                        TABS.showPreferences();
                    }
                });
            },

            getLeftTabContent: function(productId, tabId) {
		        localStorage.currentCaretPos = 0;
                $.ajax( {
                    url   : URL_TABS + 'getLeftTabContent/' + productId,
                    method: 'GET'
                } ).then( function ( data )
                {
                    var kim, metall, metallOut;
                    
                    $('#preferences1').removeClass('active');
                    $('.currentTab' )
                        .attr('id', tabId)
                        .removeClass('saveInDB addedToOrder')
                        .addClass('active ' + data.css)
                        .html(addLeftTabContentHandler($(data.html)));
                    $('.removeRow' ).hide();
                    
                    MAIN.curTabId = tabId;
                    MAIN.curTabName = 'a[href="#' + MAIN.curTabId + '"] .tabName';
                    MAIN.productId = productId;
                    
                    kim = $('.listOfKim option:selected' ).attr('kim');
                    metall = $('.listOfMetalls option:selected' ).attr('metall');
                    metallOut = $('.listOfMetalls option:selected' ).attr('metallOut');
                    
                    $('[data-cell="KIM1"]' ).val(kim);
                    $('[data-cell="PR1"]' ).val(metall);
                    $('[data-cell="PR2"]' ).val(metallOut);
                    
                    $('#calx').calx();
                    showBody();
                });
            },
            
            changeActiveTab: function (id, tabId, action) {
                $.ajax({
                    url: URL_TABS + action,
                    method: 'POST',
                    data: {
                        id: id,
                        tabId: tabId
                    }
                }).then(function (data)
                {
                    //console.log(data);
                });
            },
            
            closeTabMethod: function (idDb, currentID) {
                var nextActiveTab = MAIN.curTabId,
                    productId = MAIN.productId,
                    elemInObj = Object.keys(MAIN.tabsList),
                    ifActive, index;
                if (2 === elemInObj.length) {
                    nextActiveTab = 'preferences1';
                } else {
                    ifActive = MAIN.tabsList[currentID].active;
                    if ('1' === ifActive) {
                        index = elemInObj.indexOf(currentID);
                        if (index === elemInObj.length - 1) {
                            nextActiveTab = Object.keys(MAIN.tabsList)[elemInObj.length - 2];
                        } else {
                            nextActiveTab = Object.keys(MAIN.tabsList)[index + 1];
                        }
                        productId = MAIN.tabsList[nextActiveTab].productId;
                        MAIN.tabsList[nextActiveTab].active = '1';
                    }
                }
                delete MAIN.tabsList[currentID];
                $('[aria-controls=' + currentID + ']').hide('highlight');
                setTimeout(function () {
                    $('[aria-controls=' + currentID + ']').parent().remove();
                }, 700);
                if ('preferences1' === nextActiveTab || undefined === nextActiveTab) {
                    $('.currentTab').removeClass('active');
                    $('#preferences, #preferences1').addClass('active');
                    TABS.loadPreferences();
                } else {
                    $('[aria-controls=' + nextActiveTab + ']').parent().addClass('active');
                }

                $.ajax({
                    url: URL_TABS + 'closeTab',
                    method: 'POST',
                    data: {
                        id: idDb,
                        tabId: currentID,
                        nextActiveTab: nextActiveTab
                    }
                }).then(function (  )
                {
                    if ('preferences1' !== nextActiveTab) {
                        TABS.getLeftTabContent(productId, nextActiveTab);
                    }
                });
            },
            
            getLastLeftTab: function() {
                $.ajax( {
                    url   : URL_TABS + 'getLastLeftTab',
                    method: 'GET'
                } ).then( function ( data )
                {
                    TABS.addNewLeftTab(data);
                });
            },
            
            addNewLeftTab: function(id) {
                $.ajax( {
                    url   : URL_TABS + 'addNewLeftTab/' + id,
                    method: 'POST'
                } ).then( function ( data )
                {
                    window.location.href = LOCATION;
                });
            },
            
            changeTabName: function (obj) {
                $.ajax( {
                    url   : URL_TABS + 'changeTabName',
                    method: 'POST',
                    data: {
                        prId: MAIN.productId,
                        prName : obj.prName,
                        categoryId : obj.categoryId,
                        kimId: obj.kimId,
                        metallId: obj.metallId
                    }
                } ).then( function ( data )
                {
                    //console.log(data);
                });
            },
            
            getRightTabsList: function ()
            {
                $.ajax( {
                    url   : URL_TABS + 'getRightTabsList',
                    method: 'GET'
                } ).then( function ( data )
                {
                    if(!data.tabs) {
                        KIM.getKIMTable();
                        METALLS.getMetallsTable();
                        return true;
                    }

                    $(addRightTabsHandler($(data.html))).insertBefore( '#addNewTabRight' );
                    MAIN.tabsRightList = data.obj;
                    if('kim' !== data.tabId) {
                        TABS.getRightTabContentOrderDetails(data.orderId, data.tabId);
                        TABS.getRightTabContentTable(data.orderId);
                        return true;
                    }
                    TABS.showKim();
                });
            },

            getRightTabContentOrderDetails: function (orderId, tabId) {
                $.ajax( {
                    url   : URL_TABS + 'getRightTabContentOrderDetails/',
                    method: 'GET',
                    data: {orderId: orderId}
                } ).then( function ( data )
                {
                    if (true === data.success) {
                        $('#kimTab, #kim').removeClass('active');
                        $('.currentTabRight' )
                            .attr('id', tabId)
                            .addClass('active');
                        $('#orderDetailsWrapper').html(addRightTabContentOrderHandler($(data.html)));
                        
                        MAIN.curTabRightId = tabId;
                        MAIN.curTabRightName = 'a[href="#' + MAIN.curTabRightId + '"] .tabName';
                        MAIN.orderId = orderId;
                        
                        return this;
                    }
                    log(data.error);
                });
            },

            getRightTabContentTable: function (orderId) {
                $.ajax( {
                    url   : URL_TABS + 'getRightTabContentTable/',
                    method: 'GET',
                    data: {orderId: orderId}
                } ).then( function ( data )
                {
                    $('#orderTableWrapper').html(addRightTabContentTableHandler($(data.html)));
                });
            },

            showKim: function() {
                MAIN.tabsRightList.kim.active = '1';
                MAIN.curTabRightId = 'kim';
                KIM.getKIMTable();
                METALLS.getMetallsTable();
            },

            loadPreferences: function() {
                MAIN.tabsList['preferences1'].active = '1';
                MAIN.curTabId = 'preferences1';
                $('.bg-danger' ).fadeOut(10);
                $(MAIN.addCategoryInput ).val('');
                TABS.getCategoriesList();
            },

            showPreferences: function (){
                $('#preferences, #preferences1').addClass('active');
                TABS.loadPreferences();
                showBody();
            },

            addCategory: function(categoryName) {
                var objJSON;
                $.ajax( {
                    url   :  URL_CATEG +'add',
                    method: 'POST',
                    data: {categoryName: categoryName}
                } ).then( function ( data )
                {
                    objJSON = JSON.parse( data );
                    $.each(objJSON, function(key, val){
                        if ('ok' === val) {
                            $('#addCategoryInput' ).val('');
                            $('.bg-danger' ).fadeOut();
                            TABS.getCategoriesList();
                        } else {
                            $('.bg-danger' ).fadeIn();
                        }
                    });
                } );
            },

            getCategoriesList: function() {
                $.ajax( {
                    url   : URL_CATEG + 'getCategoriesList',
                    method: 'GET'
                } ).then( function ( data )
                {
                    $('#categoriesListTable tbody' ).html('<tr><th>Список категорий</th></tr>');
                    $.each(data, function(key, val){
                        $('#categoriesListTable tbody' ).append('<tr><td>' + val + '</td></tr>');
                    });
                } );
            }
        },

        // product section
        product: {
            saveProductInDB: function() {
                $.ajax( {
                    url   : URL_PRODUCT + 'saveProductInDB',
                    method: 'POST',
                    data: {prId: MAIN.productId}
                } ).then( function ( data )
                {
                    data ? $('#statusOfProductInDB' ).html('Сохранено в базе данных')  : false;
                });
            },

            saveTable: function () {
                $.ajax( {
                    url   : URL_PRODUCT + 'changeTableContent',
                    method: 'POST',
                    data: {
                        prId: MAIN.productId,
                        tableContent: JSON.stringify(PRODUCT.getTableContent('#sortable li')),
                        alwaysInTable: JSON.stringify(PRODUCT.getTableContent('#alwaysInTable li'))
                    }
                } ).then( function ( data )
                {
                    //console.log(data);
                });
            },
            
            getTableContent: function (dom) {
                var tableContent = {},
                    i = 0,
                    temp;
                $.each($(dom), function(key, val) {
                    temp = _.clone(tempTable);
                    if ('' !== $('.rowNumber', val ).text()) {
                        temp['%ROW_NUMBER%'] = $('.rowNumber', val ).text();
                        temp['%ROW_NAME%'] = $('.rowNameInput', val ).val();
                        temp['%DATA_CELL%'] = $('.rowValueInput', val ).attr('data-cell');
                        temp['%DATA_FORMULA%'] = $('.rowValueInput', val ).attr('data-formula');
                        temp['%INPUT_VALUE%'] = $('.rowValueInput', val ).val();
                        tableContent[i] = temp;
                        i++;
                    }
                });

                return tableContent;
            },
            
            createTable: function (tableContent, alwaysInTable) {
                $.ajax({
                    url: URL_PRODUCT + 'createTable',
                    method: 'POST',
                    data: {
                        prId: MAIN.productId,
                        tableContent: JSON.stringify(tableContent),
                        alwaysInTable: JSON.stringify(alwaysInTable)
                    }
                }).then(function (data)
                {
                    $('#sortable').html(data[0]);
                    $('#alwaysInTable').html(data[1]);
                    $('.removeRow').hide();
                });
            },
	    
            catchKey: function (el, mathAction, step) {
                var thisVal = Number($(el).val());
                if ('+' === mathAction) {
                    $(el).val((thisVal + step).toFixed(2)).attr('value', (thisVal + step).toFixed(2));
                } else {
                    $(el).val((thisVal - step).toFixed(2)).attr('value', (thisVal - step).toFixed(2));
                }
                $('#calx').calx();
                PRODUCT.saveTable();
            },
	    
            addNewFormula: function (formulas, binding) {
                $.ajax( {
                    url   : URL_PRODUCT + 'addNewFormula',
                    method: 'POST',
                    data: {
                    formulas: formulas,
                    prId : MAIN.productId
                    }
                } ).then( function ( data )
                {console.log(data);
                    if (true === binding) {
                       PRODUCT.saveTable();
                    }
                });
            },
	    
            getFormulasList: function() {
                var formulasList = {},
                    formula,
                    cell;
                $.each($('.formula'), function(key, val) {
                    formula = $('.formulaValue', val ).text();
                    cell = $.trim($('.cellBind', val ).text());
                    formulasList[key] = {
                    formula: formula,
                    cell: cell
                    };
                });
                return JSON.stringify(formulasList);
            },

            toggleAddFormula: function() {
                '' !== $('#addFormulaInputPr').val() ? $('#addFormulaBtnPr' ).slideDown() : $('#addFormulaBtnPr' ).slideUp();
            },

            cancelInputFormula: function() {
                $('#addFormulaInputPr' ).css('border-color', '' ).val('');
                $('.formulaBtnGroupPr' ).hide('drop');
                $('body')
                    .off('keypress')
                    .off('click', '.rowNumber')
                    .css('cursor', 'auto');
                $(document).keydown(function (e) {
                    if (e.which === 8) {
                    return true;
                    }
                });
                $('#formulasHelper' ).hide('slide');
            },

            addElementToFormulaInput: function(scope) {
                PRODUCT.addWhereCaret(localStorage.currentCaretPos, $(scope ).text());
                localStorage.currentCaretPos = parseInt(localStorage.currentCaretPos) + parseInt($(scope ).text().length);
                PRODUCT.toggleAddFormula();
            },

            addBtnToFormulasHelper: function (newFl) {
                $.ajax( {
                    url   : URL_PRODUCT + 'addBtnToFormulasHelper',
                    method: 'POST',
                    data: {'newFl': newFl}
                } ).then( function ( data )
                {
                    if (true === data) {
                        $('<span class="justCreated"><button type="button" class="btn custom-addRowsToTable btn-xs fhBtn">' + newFl + '' +
                        '<span class="glyphicon glyphicon-remove removeFhBtn" aria-hidden="true"></span></button></span>').insertBefore('#addNewBtnSpan');
                        $('.justCreated' ).find('.removeFhBtn').hide('fast');
                        $('.justCreated' ).show('slow' ).removeClass('.justCreated');
                        $('#addNewFhBtnInput' ).val('');
                    }

                });
            },

            removeFormulasHelper: function(dom, fhText) {
                $.ajax( {
                    url   : URL_PRODUCT + 'removeBtnFromFormulasHelper',
                    method: 'POST',
                    data: {'fhText': fhText}
                } ).then( function ( data )
                {
                    $(dom ).parent().fadeOut('slow');

                });
            },

            checkInputOnFormula: function(formula, cell) {
                var tableContent = PRODUCT.getTableContent('#sortable li'),
                    alwaysInTable = PRODUCT.getTableContent('#alwaysInTable li'),
                    cellsArr = {},
                    cellsInFormula = [],
                    res = true;
                $.each(tableContent, function (key, val) {
                    cellsArr[val['%DATA_CELL%']] = val['%DATA_FORMULA%'];
                });
                $.each(alwaysInTable, function (key, val) {
                    cellsArr[val['%DATA_CELL%']] = val['%DATA_FORMULA%'];
                });
                $.each(cellsArr, function (key) {
                    (-1 !== formula.search(key)) ? cellsInFormula.push(key) : 0;
                });
                $.each(cellsInFormula, function (key, val) {
                    (-1 !== cellsArr[val].search(cell)) ? res = false : 0;

                });
                return res;
            },

            addWhereCaret: function(caretPos, what) {
                var currentVal =  $('#addFormulaInputPr').val();
                $('#addFormulaInputPr').val(currentVal.substring(0, caretPos) + what + currentVal.substring(caretPos) );
            },

            removeChar: function(string, index){
                var res = '';
                for (var i in string) {
                    (index !== Number(i)) ? res = res + string[i] : 1;
                }

                return res;
            }
        },

        // order section
        order: {
            createNewOrder: function () {
                $.ajax({
                    url: URL_ORDER + 'createNewOrder',
                    method: 'POST'
                }).then(function (data)
                {
                    if (false !== data) {
                        window.location.href = LOCATION;
                    }
                });
            },

            saveOrderInDB: function() {
                $.ajax({
                    url: URL_ORDER + 'saveOrderInDB',
                    method: 'POST',
                    data: {orderId: MAIN.orderId}
                }).then(function (data)
                {console.log(data);
                    data ? $('#saveOrderInDBWrapper' ).html('Сохранено в базе данных') : false;
                });
            },

            checkAllInOrderDetails:  function(param) {
                $.each($('#orderDetails input'), function (key, val) {
                    $(val).prop('checked', param);
                });
            },
            
            changeDiscount: function (obj) {
                $.ajax({
                    url: URL_ORDER + 'changeDiscount',
                    method: 'POST',
                    data: obj
                }).then(function (data) {
                    console.log(data);
                });
            },

            changeOrderDetails: function(obj) {
                $.ajax( {
                    url   : URL_ORDER + 'changeOrderDetails',
                    method: 'POST',
                    data: obj
                } ).then( function ( data ) {
                    console.log(data);
                });
            },

            changeQuantity: function (obj) {
                $.ajax( {
                    url   : URL_ORDER + 'changeQuantity',
                    method: 'POST',
                    data: obj
                } ).then( function ( data ) {

                });
            },
            createJSONFromOrderDescription: function() {
                var obj = orderPlaceholder,
                    arr = _.keys(obj), i = 0;
                $.each($('.inputOrderDetails'), function(key, val){
                    obj[arr[i]] = $(val).text();
                    i++;
                });
                obj["%ESTIMATE%"] = $('#orderEstimateInput' ).val();
                obj["%DATE%"] = $('#orderDateInput' ).val();
                return obj;
            }
        },
        
        // kim section
        kim: {            
            getKIMTable: function () {
                $.ajax({
                    url: URL_KIM + 'getKIMTable',
                    method: 'GET'
                }).then(function (data)
                {
                    MAIN.kimTableContent = data.kimTableContent;
                    $('#tbodyKIM').html(addKimTableHandler($(data.html)));
                });
            },
            
            getKimList: function () {
                $.ajax({
                    url: URL_KIM + 'getKimList',
                    method: 'GET',
                    data: {
                        prId: MAIN.productId
                    }
                }).then(function (data) {
                    $('.listOfKim').html(data);
                    var kim = $('.listOfKim option:selected').attr('kim');
                    $('[data-cell="KIM1"]').val(kim);
                    $('#calx').calx();
                });
            },
            
            addKIMtoTable: function (kim, kimHard) {
                $.ajax({
                    url: URL_KIM + 'addKIMtoTable',
                    method: 'POST',
                    data: {
                        kim: kim,
                        kimHard: kimHard
                    }
                }).then(function (data)
                {
                    if (true === data) {
                        $('#kimInput, #kimHardInput').val('');
                        KIM.getKIMTable();
                        KIM.getKimList();
                    } else {

                    }
                });
            },
            
            editKim: function (kimId, kim, kimHard, save) {
                $.ajax( {
                    url   : URL_KIM + 'editKim',
                    method: 'POST',
                    data: {
                        kimId: kimId,
                        kim: kim,
                        kimHard : kimHard
                    }
                } ).then( function ( data )
                {
                    if (true === data) {
                        KIM.getKIMTable();
                        KIM.getKimList();
                    } else {
                        $(save )
                            .parents('tr')
                            .find('.kimHardName, .kimName')
                            .css({
                                'border': '3px solid hsl(0, 69%, 22%)',
                                'border-radius': '2px'
                            });
                    }
                });
            },
            
            removeKim: function (kimId) {
                $.ajax({
                    url   : URL_KIM + 'removeKim',
                    method: 'POST',
                    data: {
                    kimId: kimId
                    }
                }).then(function (data)
                {
                    console.log(data);
                    if (true === data) {
                        KIM.getKIMTable();
                        KIM.getKimList();
                    }
                });
            },
                        
            validation: function (val) {
                var res;
                res = val.replace(/[A-Za-z]+/g, '').replace(/,/g, '.');
                return res;
            }
        },
        
        // metalls section        
        metalls: {
            getMetallsTable: function() {
                $.ajax({
                    url: URL_METALLS + 'getMetallsTable',
                    method: 'GET'
                }).then(function (data){
                     $('#tbodyMetalls').html(addMetallsTableHandler($(data)));
                }); 
            },
            
            editMetall: function (obj, scope) {
                $.ajax({
                    url: URL_METALLS + 'editMetall',
                    method: 'POST',
                    data: obj
                }).then(function (data)
                {
                    if (true === data) {
                        METALLS.getMetallsTable();
                        METALLS.getMetallsList();
                    } else {
                        $(scope)
                            .parents('tr')
                            .find('.metallName, .metallPrice, .metallMass, .metallOutPrice')
                            .css({
                                'border': '3px solid hsl(0, 69%, 22%)',
                                'border-radius': '2px'
                            });
                    }
                });
            },
            
            getMetallsList: function () {
                $.ajax({
                    url: URL_METALLS + 'getMetallsList',
                    method: 'GET',
                    data: {
                        prId: MAIN.productId
                    }
                }).then(function (data) {
                    $('.listOfMetalls').html(data);
                    var metall = $('.listOfMetalls option:selected').attr('metall');
                    var metallOut = $('.listOfMetalls option:selected').attr('metallOut');
                    $('[data-cell="PR1"]').val(metall);
                    $('[data-cell="PR2"]').val(metallOut);
                    $('#calx').calx();
                });
            },
            
            addMetallToTable: function (dates) {
                $.ajax( {
                    url   : URL_METALLS + 'addMetallToTable',
                    method: 'POST',
                    data: dates
                } ).then( function ( data )
                {
                    if (true === data) {
                        $('#metallName, #metallPrice, #metallMass, #metallOutPrice').val('');
                        METALLS.getMetallsTable();
                        METALLS.getMetallsList();
                    }
                });
            },
            
            removeMetall: function(metallId) {
                $.ajax( {
                    url   : URL_METALLS + 'removeMetall',
                    method: 'POST',
                    data: {
                        metallId: metallId
                    }
                } ).then( function ( data )
                {
                    console.log(data);
                    if (true === data) {
                        METALLS.getMetallsTable();
                        METALLS.getMetallsList();
                    }
                });
            }
        },

        menu: {
            onHoverElement: function(obj){
                var scope = obj.scope,
                    css = obj.css,
                    speed = obj.speed;
                $(scope).stop(true).delay(20)
                    .animate( css, speed );
            }
        }
    };
    
    // the actual object is created here, allowing us to 'new' an object without calling 'new'
    Dima.init = function(firstName, lastName, language) {
        
        var self = this;
        self.main = {};
        SELF  = this;
        MAIN = this.main,
        TABS = this.tabs;
        ORDER = this.order;
        PRODUCT = this.product;
        KIM = this.kim;
        METALLS = this.metalls;
        MENU = this.menu;
        /*self.firstName = firstName || '';
        self.lastName = lastName || '';
        self.language = language || 'en';*/
        
        $.fn.hasAttr = function(name) {
            return this.attr(name) !== undefined;
        };
        
        run();
        
    };
    
    // trick borrowed from jQuery so we don't have to use the 'new' keyword
    Dima.init.prototype = Dima.prototype;
    
    // attach our Dima to the global object, and provide a shorthand '$G' for ease our poor fingers
    global.Dima = global.D$ = Dima;
    
}(window, jQuery));