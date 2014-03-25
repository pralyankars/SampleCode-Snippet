var testCountDetail = 0;


function formatDate(dateValue, format) {
    try {
        dateValue = new Date(dateValue);
        var fmt = format.toUpperCase();
        var re = /^(M|MM|D|DD|YYYY)([\-\/]{1})(M|MM|D|DD|YYYY)(\2)(M|MM|D|DD|YYYY)$/;
        if (!re.test(fmt)) { fmt = "MM/DD/YYYY"; }
        if (fmt.indexOf("M") == -1) { fmt = "MM/DD/YYYY"; }
        if (fmt.indexOf("D") == -1) { fmt = "MM/DD/YYYY"; }
        if (fmt.indexOf("YYYY") == -1) { fmt = "MM/DD/YYYY"; }
        var M = "" + (dateValue.getMonth() + 1);
        var MM = "0" + M;
        MM = MM.substring(MM.length - 2, MM.length);
        var D = "" + (dateValue.getDate());
        var DD = "0" + D;
        DD = DD.substring(DD.length - 2, DD.length);
        var YYYY = "" + (dateValue.getFullYear());
        var sep = "/";
        if (fmt.indexOf("-") != -1) { sep = "-"; }
        var pieces = fmt.split(sep);
        var result = "";
        switch (pieces[0]) {
            case "M": result += M + sep; break;
            case "MM": result += MM + sep; break;
            case "D": result += D + sep; break;
            case "DD": result += DD + sep; break;
            case "YYYY": result += YYYY + sep; break;
        }
        switch (pieces[1]) {
            case "M": result += M + sep; break;
            case "MM": result += MM + sep; break;
            case "D": result += D + sep; break;
            case "DD": result += DD + sep; break;
            case "YYYY": result += YYYY + sep; break;
        }
        switch (pieces[2]) {
            case "M": result += M; break;
            case "MM": result += MM; break;
            case "D": result += D; break;
            case "DD": result += DD; break;
            case "YYYY": result += YYYY; break;
        }
        return result
    }
    catch (err) {
    }
}

//function check value
function Checkval(obj) {
    $(obj).removeClass("input-validation-error");
}
//validation for Numeric value only
function ValidateDecimalValue(e, obj) {
    var keyPressed;
    if (!e) e = window.event;
    if (e.keyCode) keyPressed = e.keyCode;
    else if (e.which) keyPressed = e.which;
    var hasDecimalPoint = (($(obj).val().split('.').length - 1) > 0);
    if (keyPressed == 46 || keyPressed == 8 || ((keyPressed == 190 || keyPressed == 110) && (!hasDecimalPoint)) || keyPressed == 9 || keyPressed == 27 || keyPressed == 13 ||
        // Allow: Ctrl+A
            (keyPressed == 65 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
            (keyPressed >= 35 && keyPressed <= 39)) {
        // let it happen, don't do anything
        return;
    }
    else {
        // Ensure that it is a number and stop the keypress
        if (e.shiftKey || (keyPressed < 48 || keyPressed > 57) && (keyPressed < 96 || keyPressed > 105)) {
            e.preventDefault();
        }
    }

}

$(document).ready(function () {

    $(function () {
        $('.cross').on({
            mouseover: function () {
                $(this).find('.popup_error').show();
                $(this).find('.popup_error').removeClass('hidecross');
            }
        });
        $('.cross').on({
            mouseleave: function () {
                $(this).find('.popup_error').hide();
            }
        });
    });
});

function floorFigure(figure, decimals) {
    if (!decimals) decimals = 2;
    var d = Math.pow(10, decimals);
    return (parseInt(Math.round(figure * d)) / d).toFixed(decimals);
};

//Calculate sum of product items
function calculateSum(obj) {
    var currency = " " + $("#Currencytype").val();
    if ($(obj).attr("id") == "Discount" || $(obj).attr("id") == "Units") {
        var closetHTML = $(obj).parents('div:eq(1)');
    }
    else {
        var closetHTML = $(obj).closest("div");
    }
    var price = closetHTML.find('#Price').val();
    var vat = closetHTML.find('#Vat').val() == null ? 0 : closetHTML.find('#Vat').val().replace("%", "");
    var units = closetHTML.find('#Units').val();
    var Discount = closetHTML.find('#Discount').val();
    var DiscountType = closetHTML.find('#DiscountType').val();
    if (DiscountType == "%") {
        var totalsum = units * price * (1 + vat / 100) * (1 - Discount / 100);
        if (Discount > 100) {
            alert("Discount should not be greater than 100% .");
            closetHTML.find('#Sum').val(0 + currency);
        }
        else if (price > 0) {
            closetHTML.find('#Sum').val(floorFigure(totalsum) + currency);
        }
        else {
            closetHTML.find('#Sum').val(0 + currency);
        }
    }
    else {
        var totalsum = (units * price * (1 + vat / 100)) - Discount;
        if (price > 0) {
            closetHTML.find('#Sum').val(floorFigure(totalsum) + currency);
        }
        else {
            closetHTML.find('#Sum').val(0 + currency);
        }
    }
    var sumtotal = 0;
    $("input:text[id^=Sum]").each(function () {
        var sum = $(this).attr("value").replace(currency, "") == "" ? 0 : $(this).attr("value").replace(currency, "");
        sumtotal += parseFloat(sum);
        $('#Totalvalue').attr("value", floorFigure(sumtotal) + currency);
    });
}



//validating business oppertunity
function validatebusinessopp() {
    var errorCount = 0;
 

    $("#mainSection .row-fluid").each(function () {
        if ($(this).find("input:text[id^=Product]").val() != "" || $(this).find("input:text[id^=Price]").val() != "" || $(this).find("input:text[id^=Units]").val() != "") {

            var PriceValue = $(this).find("input:text[id^=Price]");
            if ($.trim(PriceValue.val()) == "") {
                PriceValue.addClass("input-validation-error");
                errorCount++;
            }
            else {
                PriceValue.removeClass("input-validation-error");
            }

            var ProductValue = $(this).find("input:text[id^=Product]");
            if ($.trim(ProductValue.val()) == "") {
                ProductValue.addClass("input-validation-error");
                errorCount++;
            }
            else {
                ProductValue.removeClass("input-validation-error");
            }

            var UnitsValue = $(this).find("input:text[id^=Units]");
            if ($.trim(UnitsValue.val()) == "") {
                UnitsValue.addClass("input-validation-error");
                errorCount++;
            }
            else {
                UnitsValue.removeClass("input-validation-error");
            }

        }
    });


    

    if ($.trim($("#OpportunityName").val()) == "") {
        //   $("#OpportunityName").parent().find('.cross').show();
        $("#OpportunityName").addClass("input-validation-error");
        errorCount++;
    }
    else {
        //  $("#OpportunityName").parent().find('.cross').hide();
        $("#OpportunityName").removeClass("input-validation-error");
    }
    if ($("#Note").val() == "") {
        // $("#Note").parent().find('.cross').show();
        $("#Note").addClass("input-validation-error");
        errorCount++;
    }
    else {
        //  $("#Note").parent().find('.cross').hide();
        $("#Note").removeClass("input-validation-error");
    }
    var dtVal = $('#NextActionDate').val();
    if (ValidateDate(dtVal)) {
        $("#NextActionDate").parent().find('.cross').hide();
    }
    else {
        $("#NextActionDate").parent().find('.cross').show();
        errorCount++;
    }

    var startdtVal = $('#StartDate').val();

        if (ValidateDate($('#StartDate').val())) {
            $("#StartDate").parent().find('.cross').hide();
        }
        else {
            $("#StartDate").parent().find('.cross').show();
            errorCount++;
        }


    var enddtVal = $('#EndDate').val();

        if (ValidateDate($('#EndDate').val())) {
            $("#EndDate").parent().find('.cross').hide();
        }
        else {
            $("#EndDate").parent().find('.cross').show();
            errorCount++;
        }


    var EndByDays = $('#EndByDays').val();
    if ($.trim(EndByDays) != "") {
        if (ValidateDate(EndByDays)) {
            $("#validEndByDays").hide();
            $("#EndByDays").removeClass("input-validation-error");
        }
        else {
            $("#validEndByDays").show();
            $("#EndByDays").addClass("input-validation-error");
            errorCount++;
        }
    }


    if (errorCount > 0) {
        return false;
    }
    else {
        return true;
    }
}

function ValidateDate(dtValue) {
    var dtRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
    return dtRegex.test(dtValue);
}

$("#AddAction").keypress(function () {
    $("#validAddAction").hide();
    $("#AddAction").removeClass("input-validation-error");
});

$("#DueDate").click(function () {
    // CompanyActionData.DueDate($("#validDueDate").val());
    $("#validDueDate").hide();
    $("#DueDate").removeClass("input-validation-error");
});

// validating action popup

/*
=========================================================================================================
DESCRIPTION  : ACCOUNT ADD ACTION 
=========================================================================================================  
*/
//----------------------------------------REGION STARTS--------------------------------------------------

function validateaction() {
    var flag = true;
    if ($.trim($("#AddAction").val()) == "") {
        showerrorcross($("#AddAction"));
        flag = false;
    }
    else {
        hideerrorcross($("#AddAction"));
    }
    if ($.trim($("#DueDate").val()) == "") {
        showerrorcross($("#DueDate"));
        flag = false;
    }
    else {
        hideerrorcross($("#DueDate"));
    }
    if ($('#RelatedTo').val() == "Contact person") {

        if ($('#ContactPersonId').val() == '0' && parseInt($('#ContactPersonId').children('option').length) > 1) {

            $("#ContactPersonId").parent().find('.cross').show();
            flag = false;
        }
        else {
            $("#ContactPersonId").parent().find('.cross').hide();
        }
    }
    if ($('#RelatedTo').val() == "Business opportunity") {

        if ($('#BusinessOpportunityId').val() == '0' && parseInt($('#BusinessOpportunityId').children('option').length) > 1) {
            $("#BusinessOpportunityId").parent().find('.cross').show();
        }
        else {
            $("#BusinessOpportunityId").parent().find('.cross').hide();
        }
    }
    var duedateVal = $('#DueDate').val();
    if (ValidateDate(duedateVal)) {

        $("#DueDate").parent().find('.cross').hide();


    }
    else {
        $("#DueDate").parent().find('.cross').show();
        flag = false;
    }

    if (flag == false) {
        return false;
    }
    else {
        return true;
    }
}
// validating contact popup
function validatecontact() {
    var emailaddressVal = $("#email").val();
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    var flag = true;
    var regNum = /^[-,+0-9 ]+$/;
    if ($.trim($("#firstName").val()) == "") {
        $("#firstName").parent().find('.cross').show();
        flag = false;
    }
    else {
        $("#firstName").parent().find('.cross').hide();
    }
    if ($.trim($("#lastName").val()) == "") {
        $("#lastName").parent().find('.cross').show();
        flag = false;
    }
    else {
        $("#lastName").parent().find('.cross').hide();
    }
    if ($.trim($("#email").val()) != "") {

        if (!emailReg.test(emailaddressVal)) {
            $("#email").parent().find('.popup_error').html('');
            $("#email").parent().find('.popup_error').html('Not valid format of Email.');
            $("#email").parent().find('.cross').show();
            flag = false;
        }
        else {
            $("#email").parent().find('.cross').hide();
        }
    }
    else {
        $("#email").parent().find('.cross').hide();
    }
    if ($.trim($("#contactinfo").val()) != "") {

        if (!regNum.test($("#contactinfo").val())) {
            $("#contactinfo").parent().find('.popup_error').html('');
            $("#contactinfo").parent().find('.popup_error').html('Not valid format of Phone No.');
            $("#contactinfo").parent().find('.cross').show();
            flag = false;
        }
        else {
            $("#contactinfo").parent().find('.cross').hide();
        }
    }
    else {
        $("#contactinfo").parent().find('.cross').hide();
    }

    if (flag == false) {
        return false;
    }
    else {
        return true;
    }
}
function showerrorcross(obj) {
    obj.closest('.rowvalidate').find('.cross').show().css({
        'position': 'absolute',
        'margin-left': '7px',
        'left': obj.position().left + obj.width() + 6,
        'top': obj.position().top
    });
}
function hideerrorcross(obj) {
    obj.closest('.rowvalidate').find('.cross').hide();
}
// validating notes popup
function validatenote() {
    var flag = true;
    if ($.trim($("#notetitle").val()) == "") {
        $("#notetitle").parent().find('.cross').show();
        flag = false;
    }
    else {

        $("#notetitle").parent().find('.cross').hide();
    }

    if ($.trim($("#notedesc").val()) == "") {
        $("#notedesc").parent().find('.cross').show();
        flag = false;
    }
    else {
        $("#notedesc").parent().find('.cross').hide();
    }

    if (flag == false) {
        return false;
    }
    else {
        return true;
    }
}
$(function () {

    c4u.vm.accountdetail = c4u.vm.accountdetail || {};
    var ProductItem = function (productitems, article, product, description, Vat, units, unitsType, discount, discountType, price, sum) {
        return {
            Article: ko.observable(article),
            Product: ko.observable(product),
            Description: ko.observable(description),
            vat: ko.observable(Vat),
            Units: ko.observable(units),
            UnitsType: ko.observable(unitsType),
            Discount: ko.observable(discount),
            DiscountType: ko.observable(discountType),
            Price: ko.observable(price),
            Sum: ko.observable(sum)
        };
    }
    var AccountDetailVM = function () {
        var
        self = this;
        this.firstName = ko.observable();
        self.id = ko.observable("");
        self.firstName = ko.observable("");
        self.lastName = ko.observable("");
        self.title = ko.observable("");
        self.department = ko.observable("");
        self.telephonenumber = ko.observable("");
        self.email = ko.observable(""); //.extend({ required: true, maxLength: 50, email: true }); // ko.observable("");
        self.action = ko.observable("");
        self.contactheading = ko.observable("");
        self.CreatorUserId = ko.observable("-1");
        // used to show calender in action popup
        ko.bindingHandlers.datepicker = {
            init: function (element, valueAccessor) {
                var options = valueAccessor();
                $(element).datepicker(options || {});
            }
        };

        ko.bindingHandlers.dateString = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                var value = valueAccessor(),
                    allBindings = allBindingsAccessor();
                var valueUnwrapped = ko.utils.unwrapObservable(value);
                if (valueUnwrapped != null) {
                    valueUnwrapped = new Date(valueUnwrapped.substr(valueUnwrapped.indexOf("(") + 1, 13) - 0);
                    var pattern = allBindings.datePattern || 'MM/dd/yyyy';

                    $(element).text(formatDate(valueUnwrapped, pattern));
                }
                else {
                    $(element).text();
                }
            }
        }



        var
            submitted = false,
            _tableSelector = "#accountcontact-list",
            _table = null,

            _selectedUserId = ko.observable(-1),

          CompanyAccountData = {
              id: self.id,
              firstName: self.firstName,
              lastName: self.lastName,
              title: self.title,
              telephonenumber: self.telephonenumber,
              email: self.email,
              action: self.action,
              contactheading: self.contactheading,
              actionName: self.actionName,
              CreatorUserId: self.CreatorUserId
          };

        _deleteaccountcontact = function (item) {
            if (_ALLOW_DELETE_ACCOUNT == 'False' && item.CreatorUserId == parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete contacts");
                return false;
            }
            if (_ALLOW_DELETE_OTHER == 'False' && item.CreatorUserId != parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete other contacts");
                return false;
            }
            if (confirm("Are you sure want to delete?")) {
                $.post(pageResolveURL + "/CRM/Crm/DeleteContact", { id: item.id }, function (result) {

                    if (result.success) {
                        _refreshcontactDatatable();

                        $("#ContactPersonId").html('');
                        var markup = '';
                        if (result.Data.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.Data.length; x++) {
                                markup += "<option value='" + result.Data[x].id + "'>" + result.Data[x].fullName + "</option>";
                            }
                        }
                        $("#ContactPersonId").html(markup);
                        $("#ContactPersonId").selectpicker('refresh');

                        //ContactPersonIds
                        $("#nxt_act").find("#ContactPersonIds").html('');
                        var markup = '';
                        if (result.Data.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.Data.length; x++) {
                                markup += "<option value='" + result.Data[x].id + "'>" + result.Data[x].fullName + "</option>";
                            }
                        }
                        $("#nxt_act").find("#ContactPersonIds").html(markup);
                        $("#nxt_act").find("#ContactPersonIds").selectpicker('refresh');

                        $("#add-business-opp-modal").find("#contactPersonId").html('');
                        var markup1 = '';
                        if (result.BopContact.length > 0) {
                            markup1 += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.BopContact.length; x++) {
                                markup1 += "<option value='" + result.BopContact[x].ContactPersonId + "'>" + result.BopContact[x].FullName + "</option>";
                            }
                        }

                        $("#add-business-opp-modal").find("#contactPersonId").html(markup1);
                        $("#add-business-opp-modal").find("#contactPersonId").selectpicker('refresh');

                        c4u.alerts.success(c4u.msg.ContactDeleteSuccess);

                        $("#ActionList").html('');
                        var markup1 = '';
                        if (result.ActionName.length > 0) {
                            markup1 += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.ActionName.length; x++) {
                                markup1 += "<option value='" + result.ActionName[x].Value + "'>" + result.ActionName[x].Text + "</option>";
                            }
                        }

                        $("#ActionList").html(markup1);
                        $("#ActionList").selectpicker('refresh');
                        _refreshcontactDatatable();
                        _refreshactionDatatable();
                    }
                    else {
                        //$("#info").text('Contact was not deleted. Please try again!');
                        //$(".info").show("slow");
                        //$(".info").fadeOut(5000);
                        c4u.alerts.error(c4u.msg.ContactDeleteError);
                    }

                });
            }
            else {
                return false;
            }
        },

            _getData = function (options, callback) {
                $('.spinnermodal').show();
                $.ajax({
                    url: pageResolveURL + "/CRM/Crm/AccountContactList",
                    data: ko.toJSON(options),
                    type: "POST",
                    contentType: "application/json charset=utf-8",
                    dataType: "json",
                    success: function (response, textStatus, jqXHR) {
                        callback(response.data);
                        $('.spinnermodal').hide();
                    }
                });
            },

			_removeUser = function (item) {
			    if (item == _users()[0]) {
			        c4u.alerts.warning(c4u.msg.cantDeleteAdmin);
			    }
			    else {
			        _users.remove(item);
			    }
			},

            _isArrayValid = function (array) {
                var result = true;
                for (var i = 0; i < array.length; i++) {
                    var show = false;
                    var isValidation = array[i].isValid() ? result : array[i].isValid();
                    if (array[i].firstName() || array[i].lastName() || array[i].email() || i == 0) {
                        show = true;
                        result = isValidation;
                    }
                    array[i].errors.showAllMessages(show);
                }

                return result;
            },
        _blankcontactdata = function () {
            CompanyAccountData.id('');
            CompanyAccountData.firstName('');
            CompanyAccountData.lastName('');
            CompanyAccountData.telephonenumber('');
            CompanyAccountData.title('');
            CompanyAccountData.email('');
            CompanyAccountData.action('');
            $(".selectpicker").selectpicker('refresh');
            CompanyAccountData.contactheading('Add New Contact');
            UnValidate();

            $.post(pageResolveURL + "/CRM/Crm/ShowActionDetail", { id: "" }, function (result) {
                if (result.success) {

                    $("#ActionList").html('');
                    var markup = '';
                    if (result.ActionName.length > 0) {
                        markup += "<option value='0'>Select Action</option>";
                        for (var x = 0; x < result.ActionName.length; x++) {
                            markup += "<option value='" + result.ActionName[x].Value + "'>" + result.ActionName[x].Text + "</option>";
                        }
                    }
                    $("#ActionList").html(markup);
                    $("#ActionList").selectpicker('refresh');

                }
                else {

                }
            });




        },
            _showEditaccountcontact = function (item) {
                if (_ALLOW_CANEDITOWNCRMACCOUNT == 'False' && item.CreatorUserId == parseInt(_USER_ID)) {
                    c4u.alerts.error("You are not allowed to edit contacts");
                    return false;
                }
                if (_ALLOW_EDIT_OTHER == 'False' && item.CreatorUserId != parseInt(_USER_ID)) {
                    c4u.alerts.error("You are not allowed to edit other contacts");
                    return false;
                }
                if (item.actionName == "") {
                    $("#ActionList").val("");
                }
                if (item.actionName != "" && $('#ActionList option[value=' + item.action + ']').length == 0) {
                    //   $("#ActionList").append($('<option></option>').val(item.action).html(item.actionName));
                }
                _selectedUserId(item.id);
                CompanyAccountData.id(item.id);
                CompanyAccountData.firstName(item.firstName);
                CompanyAccountData.lastName(item.lastName);
                CompanyAccountData.telephonenumber(item.telephonenumber);
                CompanyAccountData.title(item.title);
                CompanyAccountData.email(item.email);
                CompanyAccountData.action(item.action);
                CompanyAccountData.contactheading('Edit Contact');

                validatecontact();



                $.post(pageResolveURL + "/CRM/Crm/ShowActionDetail", { id: item.action }, function (result) {
                    if (result.success) {

                        $("#ActionList").html('');
                        var markup = '';
                        if (result.ActionName.length > 0) {
                            markup += "<option value='0'>Select Action</option>";
                            for (var x = 0; x < result.ActionName.length; x++) {
                                markup += "<option value='" + result.ActionName[x].Value + "'>" + result.ActionName[x].Text + "</option>";
                            }
                        }
                        $("#ActionList").html(markup);
                        $("#ActionList").val(item.action);



                        $("#ContactPersonId").selectpicker('refresh');
                        $("#ActionList").selectpicker('refresh');
                        $("#add-contact-modal").find(':button').removeClass("disabled");
                        $("#add-contact-modal").find('.dropdown-menu').find("ul li").removeClass("disabled");
                        $("#add-contact-modal").find(":input").removeAttr("disabled");
                        $("#add-contact-modal").find('#submitcontact').show();
                        $("#add-contact-modal").modal("show");

                        $(".selectpicker").selectpicker('refresh');

                    }
                    else {

                    }
                });



            };

        //**************************Billing Address ***************************************
        var
       submitted = false,
       _tableAddressSelector = "#address-list",
       _tableAddress = null,
       self = this;
        _selectedAddressTypeId = ko.observable(-1),
             self.id = ko.observable(""),
             self.AddressType = ko.observable(""),
             self.Street = ko.observable(""),
             self.Country = ko.observable(""),
             self.State = ko.observable(""),
             self.ZipCode = ko.observable(""),
             self.UserId = ko.observable("-1")
        CompanyAddressData = {
            id: self.id,
            AddressType: self.AddressType,
            Street: self.Street,
            Country: self.Country,
            State: self.State,
            ZipCode: self.ZipCode,
            contactheading: self.contactheading,
            actionName: self.actionName,
            UserId: self.UserId
        };
        _deleteAddress = function (item) {
            if (_ALLOW_DELETE_ACCOUNT == 'False' && item.UserId == parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete addresses");
                return false;
            }
            if (_ALLOW_DELETE_OTHER == 'False' && item.UserId != parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete other addresses");
                return false;
            }
            if (confirm("Are you sure want to delete?")) {
                $.post(pageResolveURL + "/CRM/Crm/DeleteAddress", { id: item.id }, function (result) {
                    if (result.success) {
                        _refreshAddressDatatable();
                        $("#ContactPersonId").html('');
                        var markup = '';
                        if (result.Data.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.Data.length; x++) {
                                markup += "<option value='" + result.Data[x].id + "'>" + result.Data[x].fullName + "</option>";
                            }
                        }
                        $("#ContactPersonId").html(markup);
                        $("#ContactPersonId").selectpicker('refresh');
                        c4u.alerts.success(c4u.msg.AddressDeleteSuccess);
                    }
                    else {
                        c4u.alerts.error(c4u.msg.AddressDeleteError);
                    }

                });
            }
            else {
                return false;
            }
        },
         _getAddressData = function (options, callback) {
             $('.spinnermodal').show();
             $.ajax({
                 url: pageResolveURL + "/CRM/Crm/AddressList",
                 data: ko.toJSON(options),
                 type: "POST",
                 contentType: "application/json charset=utf-8",
                 dataType: "json",
                 success: function (response, textStatus, jqXHR) {
                     callback(response.data);
                     $('.spinnermodal').hide();
                 }
             });
         },
         _blankAddressData = function () {
             CompanyAddressData.id('');
             CompanyAddressData.AddressType('');
             CompanyAddressData.Street('');
             CompanyAddressData.Country('');
             CompanyAddressData.State('');
             CompanyAddressData.ZipCode('');

             CompanyAddressData.contactheading('Add New Address');
             $(".selectpicker").selectpicker('refresh');
         },
            _showEditaddress = function (item) {
                if (_ALLOW_CANEDITOWNCRMACCOUNT == 'False' && item.UserId == parseInt(_USER_ID)) {
                    c4u.alerts.error("You are not allowed to edit addresses");
                    return false;
                }
                if (_ALLOW_EDIT_OTHER == 'False' && item.UserId != parseInt(_USER_ID)) {
                    c4u.alerts.error("You are not allowed to edit other addresses");
                    return false;
                }
                _selectedAddressTypeId(item.AddressType);
                CompanyAddressData.id(item.id);
                CompanyAddressData.AddressType(item.AddressType);
                CompanyAddressData.Street(item.Street);
                CompanyAddressData.Country(item.Country);

                CompanyAddressData.State(item.State);
                CompanyAddressData.ZipCode(item.ZipCode);
                CompanyAddressData.contactheading('Edit Billing Address');
                $(".selectpicker").selectpicker('refresh');

                $("#add-billingAdd-modal").find(':button').removeClass("disabled");
                $("#add-billingAdd-modal").find('.dropdown-menu').find("ul li").removeClass("disabled");
                $("#add-billingAdd-modal").find(":input").removeAttr("disabled");
                $("#add-billingAdd-modal").find('#submitAddress').show();
                $("#add-billingAdd-modal").modal("show");
            }
        _isValid = function () {
            return _isArrayValid(_users());
        }.bind(this),

        _submit = function () {
            if (_isValid() == true) {
                _submitForm();
            }
        },

        _submitForm = function () {
            if (!submitted) {
                submitted = true;
                $("form").submit();
            }
        };

        //************* Function to save the Billing address*************
        _saveAddress = function () {




            var AddressDetail = $("#AddressList").val();
            // alert($("#AddressList").parent("section").html());
            if (AddressDetail == "") {
                $("#AddressList").parent("section").find(".cross").show();
                return false;
            }
            $.ajax({
                type: "POST",
                url: pageResolveURL + "/Crm/Crm/AddAddressPartial",
                data: ko.toJSON(CompanyAddressData), //Convert the Observable Data into JSON
                contentType: "application/json",
                success: function (result) {

                    if (result.success == false) {
                        c4u.alerts.error(c4u.msg.AddressSaveError);
                        $("#add-billingAdd-modal").modal("show");
                    }
                    else {
                        _refreshAddressDatatable();
                        $("#ContactPersonId").html('');
                        var markup = '';
                        if (result.Data.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.Data.length; x++) {
                                markup += "<option value='" + result.Data[x].id + "'>" + result.Data[x].fullName + "</option>";
                            }
                        }
                        $("#ContactPersonId").html(markup);
                        $("#ContactPersonId").selectpicker('refresh');

                        $("#nxt_act").find("#ContactPersonIds").html('');
                        var markup = '';
                        if (result.Data.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.Data.length; x++) {
                                markup += "<option value='" + result.Data[x].id + "'>" + result.Data[x].fullName + "</option>";
                            }
                        }
                        $("#nxt_act").find("#ContactPersonIds").html(markup);
                        $("#nxt_act").find("#ContactPersonIds").selectpicker('refresh');
                        c4u.alerts.success(c4u.msg.AddressSaveSuccess);
                        $("#add-billingAdd-modal").modal("hide");
                    }
                },
                error: function () {
                    c4u.alerts.error(c4u.msg.AddressSaveError);
                    $("#add-billingAdd-modal").modal("show");
                }
            });

        };

        //Function to perform POST (insert contact) operation
        self.save = function () {

          




            if ($(".headerpopup").text().toLowerCase() == "edit contact" && $("#EditPermission").val() == "false") {
                c4u.alerts.error('You dont have permission to edit others account action');
                $("#add-contact-modal").modal("hide");
                return;
            }
            if (validatecontact()) {
                $.ajax({
                    type: "POST",
                    url: pageResolveURL + "/Crm/Crm/AddContactPartial",
                    data: ko.toJSON(CompanyAccountData), //Convert the Observable Data into JSON
                    contentType: "application/json",
                    success: function (result) {

                        if (result.success == false) {
                            c4u.alerts.error(c4u.msg.ContactSaveError);
                            $("#add-contact-modal").modal("show");
                        }
                        else {
                            _refreshcontactDatatable();
                            $("#ContactPersonId").html('');
                            var markup = '';
                            if (result.AcccountContactVMlist.length > 0) {
                                markup += "<option value='0'>Select</option>";
                                for (var x = 0; x < result.AcccountContactVMlist.length; x++) {
                                    markup += "<option value='" + result.AcccountContactVMlist[x].id + "'>" + result.AcccountContactVMlist[x].fullName + "</option>";
                                }
                            }

                            $("#ContactPersonId").html(markup);
                            $("#ContactPersonId").selectpicker('refresh');


                            $("#nxt_act").find("#ContactPersonIds").html('');
                            var markup1 = '';
                            if (result.AcccountContactVMlist.length > 0) {
                                markup1 += "<option value='0'>Select</option>";
                                for (var x = 0; x < result.AcccountContactVMlist.length; x++) {
                                    markup1 += "<option value='" + result.AcccountContactVMlist[x].id + "'>" + result.AcccountContactVMlist[x].firstName + " " + result.AcccountContactVMlist[x].lastName + "</option>";
                                }
                            }

                            $("#nxt_act").find("#ContactPersonIds").html(markup1);
                            $("#nxt_act").find("#ContactPersonIds").selectpicker('refresh');


                            $("#add-business-opp-modal").find("#contactPersonId").html('');
                            var markup1 = '';
                            if (result.BopContact.length > 0) {
                                markup1 += "<option value='0'>Select</option>";
                                for (var x = 0; x < result.BopContact.length; x++) {
                                    markup1 += "<option value='" + result.BopContact[x].ContactPersonId + "'>" + result.BopContact[x].FullName + "</option>";
                                }
                            }

                            $("#add-business-opp-modal").find("#contactPersonId").html(markup1);
                            $("#add-business-opp-modal").find("#contactPersonId").selectpicker('refresh');

                            $("#ActionList").html('');
                            var markup1 = '';
                            if (result.ActionName.length > 0) {
                                markup1 += "<option value='0'>Select</option>";
                                for (var x = 0; x < result.ActionName.length; x++) {
                                    markup1 += "<option value='" + result.ActionName[x].Value + "'>" + result.ActionName[x].Text + "</option>";
                                }
                            }
                            $("#ActionList").html(markup1);
                            $("#ActionList").selectpicker('refresh');
                            c4u.alerts.success(c4u.msg.ContactSaveSuccess);
                            $("#add-contact-modal").modal("hide");
                            _refreshcontactDatatable();
                            _refreshactionDatatable();
                        }
                    },
                    error: function () {
                        c4u.alerts.error(c4u.msg.ContactSaveError);
                        $("#add-contact-modal").modal("show");
                    }
                });
            }
        };






        _showEditaccountaction = function (item) {
            if (_ALLOW_CANEDITOWNCRMACCOUNT == 'False' && item.CreatedBy == parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to edit action");
                return false;
            }
            if (_ALLOW_EDIT_OTHER == 'False' && item.CreatedBy != parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to edit others action");
                return false;
            }

            if (item.ContactPersonId == "00000000-0000-0000-0000-000000000000") {
                $("#ContactPersonId").val("");
            }

            if (item.ContactPersonId != "00000000-0000-0000-0000-000000000000" && $('#ContactPersonId option[value=' + item.ContactPersonId + ']').length == 0) {
                //  $("#ContactPersonId").append($('<option></option>').val(item.ContactPersonId).html(item.RelatedToAccount));
            }

            if (item.BusinessOpportunityId == "00000000-0000-0000-0000-000000000000") {
                $("#BusinessOpportunityId").val("");
            }
            _selectedUserId(item.id);
            CompanyActionData.id(item.id);
            CompanyActionData.AddAction(item.AddAction);
            CompanyActionData.Status(item.Status);
            item.DueDate = moment(item.DueDate).format('MM/DD/YYYY');
            CompanyActionData.DueDate(item.DueDate);
            CompanyActionData.AssignedTo(item.AssignedTo);
            CompanyActionData.RelatedTo(item.RelatedTo);
            CompanyActionData.Priority(item.Priority);
            CompanyActionData.Comment(item.Comment);
            CompanyActionData.ActionType(item.ActionType);
            CompanyActionData.BusinessOpportunityId(item.BusinessOpportunityId);
            CompanyActionData.ContactPersonId(item.ContactPersonId);
            //CompanyAccountData.InvoiceDate(item.InvoiceDate);
            //CompanyAccountData.InvoiceExpireDate(item.InvoiceExpireDate);
            CompanyActionData.actionheading("Edit Action");
            //$("#add-action-modal").bind('show', function (e) {
            //    $('select#RelatedTo').change();
            //})
            $("#ActionList").selectpicker('refresh');
            $("#add-action-modal").modal("show");
            $.post(pageResolveURL + "/CRM/Crm/ShowContactDetail", { id: item.ContactPersonId }, function (result) {
                if (result.success) {


                    $("#contactPersonId").html('');
                    var markup = '';
                    if (result.ContactName.length > 0) {
                        markup += "<option value='0'>Select Contact</option>";
                        for (var x = 0; x < result.ContactName.length; x++) {
                            markup += "<option value='" + result.ContactName[x].Value + "'>" + result.ContactName[x].Text + "</option>";
                        }
                    }
                    $("#ContactPersonId").html(markup);
                    $("#ContactPersonId").val(item.ContactPersonId);
                    $("#ContactPersonId").selectpicker('refresh');
                    $(".selectpicker").selectpicker('refresh');
                    //  $("#ContactPersonId").val(item.ContactPersonId);

                }
                else {

                }
            });


            // $("#ContactPersonId").selectpicker('refresh');

            //BusinessOpportunity.contactPersonId($("#add-action-modal").find("#ContactPersonId").val());
            //BusinessOpportunity.BusinessOpportunityId($("#add-action-modal").find("#BusinessOpportunityId").val());
            //$('select#RelatedTo').change();
        };
        _blankaction = function () {

            CompanyActionData.id('');
            CompanyActionData.AddAction('');
            CompanyActionData.Status('');
            CompanyActionData.DueDate('');
            CompanyActionData.AssignedTo('');
            CompanyActionData.RelatedTo('');
            CompanyActionData.Priority('');
            CompanyActionData.Comment('');
            CompanyActionData.ActionType('');
            CompanyActionData.BusinessOpportunityId('');
            CompanyActionData.ContactPersonId('');
            $(".selectpicker").selectpicker('refresh');
            CompanyActionData.actionheading("Add New Action");
            UnValidate();

            $.post(pageResolveURL + "/CRM/Crm/ShowContactDetail", { id: item.ContactPersonId }, function (result) {
                if (result.success) {

                    $("#ContactPersonId").html('');
                    var markup = '';
                    if (result.ContactName.length > 0) {
                        markup += "<option value='0'>Select Contact</option>";
                        for (var x = 0; x < result.ContactName.length; x++) {
                            markup += "<option value='" + result.ContactName[x].Value + "'>" + result.ContactName[x].Text + "</option>";
                        }
                    }
                    $("#ContactPersonId").html(markup);
                    $("#ContactPersonId").selectpicker('refresh');

                }
                else {

                }
            });
            //CompanyAccountData.InvoiceDate('');
            // CompanyAccountData.InvoiceExpireDate('');

        };








        ////************* started Business Oppertunity ********************************************

        var
                  _tableBusinessSelector = "#accountbusinessopp-list",
                  _tableBusiness = null;
        self._productitems = ko.observableArray();
        self.OpportunityId = ko.observable("");
        self.NextActionDate = ko.observable("");
        self.OpportunityName = ko.observable("");
        self.Note = ko.observable("");
        self.Statustype = ko.observable("");
        self.Currencytype = ko.observable("");
        self.contactPersonId = ko.observable("");
        self.businessheading = ko.observable("");
        self.Totalvalue = ko.observable("");
        self.StartDate = ko.observable("");
        self.EndDate = ko.observable("");
        self.EditOpportunity = ko.observable("");
        self.IsRecurring = ko.observable("");
        self.RecurrenceType = ko.observable("");
        self.DailyType = ko.observable("");
        self.Dailydays = ko.observable("");
        self.WeeklyDays = ko.observable("");
        self.Sun = ko.observable("");
        self.Mon = ko.observable("");
        self.Tue = ko.observable("");
        self.Wed = ko.observable("");
        self.Thu = ko.observable("");
        self.Fri = ko.observable("");
        self.Sat = ko.observable("");
        self.MonthType = ko.observable("");
        self.MonthDays = ko.observable("");
        self.MonthlyMonths = ko.observable("");
        self.Monthly_WeekNumber = ko.observable("");
        self.Monthly_WeekDays = ko.observable("");
        self.Monthly_Months2 = ko.observable("");
        self.YearlyType = ko.observable("");
        self.YearlyMonths = ko.observable("");
        self.Yearly_Days = ko.observable("");
        self.Yearly_WeekNumber = ko.observable("");
        self.Yearly_WeekDays = ko.observable("");
        self.Yearly_Months2 = ko.observable("");
        self.RecureTypes = ko.observable("");
        self.EndAfterDays = ko.observable("");
        self.EndByDays = ko.observable("");
        self.ShippingAddressType = ko.observable("");
        self.ShippingStreet = ko.observable("");
        self.ShippingCountry = ko.observable("");
        self.ShippingState = ko.observable("");
        self.ShippingZipCode = ko.observable("");
        self.BillingAddressType = ko.observable("");
        self.BillingStreet = ko.observable("");
        self.BillingCountry = ko.observable("");
        self.BillingState = ko.observable("");
        self.BillingZipCode = ko.observable("");
        self.DueDate1 = ko.observable("");
        self.Comment = ko.observable("");
        self.AddAction = ko.observable("");
        self.Priority = ko.observable("");
        self.RelatedTo = ko.observable("");
        self.ActionType = ko.observable("");
        self.AssignedTo = ko.observable("");
        self.Status = ko.observable("");
        self.InvoiceDate = ko.observable("");
        self.InvoiceExpireDate = ko.observable("");
        self.BusinessOpportunityId = ko.observable("");
        self.contactPersonActionId = ko.observable("");
        self.CreatedBy = ko.observable("-1");
        _addmoreproduct = function (item) {
            self._productitems.push(new ProductItem(null, item.Article, item.Product, item.Description, item.vat, item.Units, item.UnitsType, item.Discount, item.DiscountType, item.Price, item.Sum));


            $(".selectpicker").selectpicker('refresh');
            $("#mainSection").find(".row-fluid").each(function () {

                $(this).find(".newwidth").each(function () {

                    $(this).find("[type='button']").css("width", "65px");

                });
            });


        },

        _removeproduct = function (item) {
            if (item == self._productitems()[0]) {
                c4u.alerts.warning(c4u.msg.cantDeleteAdmin);
            }
            else {
                self._productitems.remove(item);
                var sumtotal = 0;
                $("input:text[id^=Sum]").each(function () {
                    var currency = " " + $("#Currencytype").val();
                    var sum = $(this).attr("value").replace(currency, "");
                    if (sum > 0) {
                        sumtotal += parseFloat(sum);
                        $('#Totalvalue').attr("value", floorFigure(sumtotal) + currency);
                    }
                    else {
                        $('#Totalvalue').attr("value", "0" + currency);
                    }
                });
                //  $('#Totalvalue').attr("value", $('#Totalvalue').attr("value") + " USD");
            }
            $(".selectpicker").selectpicker('refresh');
        };
        var BusinessOpportunity = {
            id: self.id,
            OpportunityId: self.OpportunityId,
            NextActionDate: self.NextActionDate,
            OpportunityName: self.OpportunityName,
            Note: self.Note,
            Statustype: self.Statustype,
            Currencytype: self.Currencytype,
            contactPersonId: self.contactPersonId,
            businessheading: self.businessheading,
            Productitems: self._productitems,
            Totalvalue: self.Totalvalue,
            StartDate: self.StartDate,
            EndDate: self.EndDate,
            EditOpportunity: self.EditOpportunity,
            IsRecurring: self.IsRecurring,
            RecurrenceType: self.RecurrenceType,
            DailyType: self.DailyType,
            Dailydays: self.Dailydays,
            WeeklyDays: self.WeeklyDays,
            Sun: self.Sun,
            Mon: self.Mon,
            Tue: self.Tue,
            Wed: self.Wed,
            Thu: self.Thu,
            Fri: self.Fri,
            Sat: self.Sat,
            MonthType: self.MonthType,
            MonthDays: self.MonthDays,
            MonthlyMonths: self.MonthlyMonths,
            Monthly_WeekNumber: self.Monthly_WeekNumber,
            Monthly_WeekDays: self.Monthly_WeekDays,
            Monthly_Months2: self.Monthly_Months2,
            YearlyType: self.YearlyType,
            YearlyMonths: self.YearlyMonths,
            Yearly_Days: self.Yearly_Days,
            Yearly_WeekNumber: self.Yearly_WeekNumber,
            Yearly_WeekDays: self.Yearly_WeekDays,
            Yearly_Months2: self.Yearly_Months2,
            RecureTypes: self.RecureTypes,
            EndAfterDays: self.EndAfterDays,
            EndByDays: self.EndByDays,
            ShippingAddressType: self.ShippingAddressType,
            ShippingStreet: self.ShippingStreet,
            ShippingCountry: self.ShippingCountry,
            ShippingState: self.ShippingState,
            ShippingZipCode: self.ShippingZipCode,
            BillingAddressType: self.BillingAddressType,
            BillingStreet: self.BillingStreet,
            BillingCountry: self.BillingCountry,
            BillingState: self.BillingState,
            BillingZipCode: self.BillingZipCode,
            DueDate1: self.DueDate1,
            Comment: self.Comment,
            AddAction: self.AddAction,
            Priority: self.Priority,
            RelatedTo: self.RelatedTo,
            ActionType: self.ActionType,
            AssignedTo: self.AssignedTo,
            Status: self.Status,
            InvoiceDate: self.InvoiceDate,
            InvoiceExpireDate: self.InvoiceExpireDate,
            BusinessOpportunityId: self.BusinessOpportunityId,
            contactPersonActionId: self.contactPersonActionId,
            CreatedBy: self.CreatedBy,
            addmoreproduct: function (item) {
                var obj = new ProductItem(null, item.Article, item.Product, item.Description, item.vat, item.Units, item.UnitsType, item.Discount, item.DiscountType, item.Price, item.Sum == undefined ? "0 " + $("#Currencytype").val() : item.Sum + " " + $("#Currencytype").val());
                self._productitems.push(new ProductItem(null, obj.Article, obj.Product, obj.Description, obj.vat, obj.Units, obj.UnitsType, obj.Discount, obj.DiscountType, obj.Price, obj.Sum));
                $("#mainSection").find(".user-row").last().find("div.verysmallselect").remove();
                $("#mainSection").find(".user-row").last().find("div.discountSelect").remove();
                $("#mainSection").find(".user-row").last().find("div.unitSelect").remove();
                $(".selectpicker").selectpicker('refresh');
                $("#mainSection").find(".row-fluid").each(function () {

                    $(this).find(".newwidth").each(function () {

                        $(this).find("[type='button']").css("width", "65px");

                    });
                });




            }
        };
        self.savebusiness = function () {
            if ($(".headerpopup").text().toLowerCase() == "edit business opportunity" && $("#EditPermission").val() == "false") {
                c4u.alerts.error('You donot have permission to edit others account opportunity');
                $("#add-business-opp-modal").modal("hide");
                return;
            }
            if (validatebusinessopp()) {
                $("#add-business-opp-modal").modal("hide");
                BusinessOpportunity.NextActionDate($("#NextActionDate").val());
                BusinessOpportunity.StartDate($('#StartDate').val());
                BusinessOpportunity.EndDate($('#EndDate').val());
                BusinessOpportunity.EndByDays($('#EndByDays').val());
                BusinessOpportunity.ActionType($("#ActionType").val());
                BusinessOpportunity.DueDate1($("#DueDate1").val());
                BusinessOpportunity.Priority($("#Priority").val());
                BusinessOpportunity.AssignedTo($("#AssignedTo").val());
                BusinessOpportunity.Status($("#Status").val());
                BusinessOpportunity.InvoiceDate($("#InvoiceDate").val());
                BusinessOpportunity.InvoiceExpireDate($("#InvoiceExpireDate").val());
                //  BusinessOpportunity.contactPersonId($("#ContactPersonId").val());
                BusinessOpportunity.contactPersonActionId($("#nxt_act").find("#ContactPersonIds").val());
                BusinessOpportunity.BusinessOpportunityId($("#nxt_act").find("#BusinessOpportunityId").val());
                //Ajax call to Insert the Employee
                $.ajax({
                    type: "POST",
                    url: pageResolveURL + "/Crm/Crm/AddbusinessOpportunity", // '@Url.Content("~/Crm/Crm/AddContactPartial")',
                    data: ko.toJSON(BusinessOpportunity), //Convert the Observable Data into JSON
                    contentType: "application/json",
                    success: function (result) {
                        if (result.success == false) {
                            c4u.alerts.error(c4u.msg.BusinessSaveError);
                            $("#add-business-opp-modal").modal("show");
                        }
                        else {
                            _refreshDatatable();
                            _refreshactionDatatable();
                            c4u.alerts.success(c4u.msg.BusinessSaveSuccess);
                            $("#add-business-opp-modal").modal("hide");
                        }

                        $("#BusinessOpportunityId").html('');
                        var markup = '';
                        if (result.bopList.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.bopList.length; x++) {
                                markup += "<option value='" + result.bopList[x].Value + "'>" + result.bopList[x].Text + "</option>";
                            }
                        }
                        $("#BusinessOpportunityId").html(markup);

                        $("#BusinessOpportunityId").selectpicker('refresh');

                        $("#ContactPersonId").html('');
                        var markup1 = '';
                        if (result.accountContactList.length > 0) {
                            markup1 += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.accountContactList.length; x++) {
                                markup1 += "<option value='" + result.accountContactList[x].id + "'>" + result.accountContactList[x].firstName + " " + result.accountContactList[x].lastName + "</option>";
                            }
                        }
                        $("#ContactPersonId").html(markup1);

                        $("#nxt_act").find("#ContactPersonIds").html('');
                        var markup1 = '';
                        if (result.accountContactList.length > 0) {
                            markup1 += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.accountContactList.length; x++) {
                                markup1 += "<option value='" + result.accountContactList[x].id + "'>" + result.accountContactList[x].firstName + " " + result.accountContactList[x].lastName + "</option>";
                            }
                        }

                        $("#nxt_act").find("#ContactPersonIds").html(markup1);
                        $("#nxt_act").find("#ContactPersonIds").selectpicker('refresh');

                    },
                    error: function () {
                        c4u.alerts.error(c4u.msg.BusinessSaveError);
                        $("#add-business-opp-modal").modal("show");
                    }
                });
            }
            //Ends Here
        };
        _getDatabusinessopp = function (options, callback) {
            $.ajax({
                url: pageResolveURL + "/CRM/Crm/BusinessOpportunityList",
                data: ko.toJSON(options),
                type: "POST",
                contentType: "application/json charset=utf-8",
                dataType: "json",
                success: function (response, textStatus, jqXHR) {

                    callback(response.data);
                }
            });
        },
        _deletebusinessopp = function (item) {
            if (_ALLOW_DELETE_ACCOUNT == 'False' && item.CreatedBy == parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete");
                return false;
            }
            if (_ALLOW_DELETE_OTHER == 'False' && item.CreatedBy != parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete");
                return false;
            }
            if (confirm("Are you sure want to delete?")) {
                $.post(pageResolveURL + "/CRM/Crm/DeleteBusinessOpportunity", { id: item.id }, function (result) {

                    if (result.success) {
                        _refreshDatatable();
                        c4u.alerts.success(c4u.msg.BusinessDeleteSuccess);
                    }
                    else {
                        c4u.alerts.error(c4u.msg.BusinessDeleteError);
                    }
                });
            }
        },
         _showEditbusinessopp = function (item) {
             if (_ALLOW_CANEDITOWNCRMACCOUNT == 'False' && item.CreatedBy == parseInt(_USER_ID)) {
                 c4u.alerts.error("You are not allowed to edit");
                 return false;
             }
             if (_ALLOW_EDIT_OTHER == 'False' && item.CreatedBy != parseInt(_USER_ID)) {
                 c4u.alerts.error("You are not allowed to edit");
                 return false;
             }
             $("#hdnId").val(item.id);
             _selectedUserId(item.id);
             _refreshBusinessDatatable();
             _refreshBusinessActionDatatable();
             BusinessOpportunity.id(item.id);
             BusinessOpportunity.OpportunityId(item.OpportunityId);
             // used to change date format
             //var valueUnwrapped = ko.utils.unwrapObservable(item.NextActionDate);
             //valueUnwrapped = new Date(valueUnwrapped.substr(valueUnwrapped.indexOf("(") + 1, 13) - 0);
             //item.NextActionDate = formatDate(valueUnwrapped, 'MM/dd/yyyy');
             BusinessOpportunity.NextActionDate(item.NextActionDateString);
             BusinessOpportunity.OpportunityName(item.OpportunityName);
             BusinessOpportunity.Note(item.Note);
             BusinessOpportunity.Statustype(item.Statustype);
             BusinessOpportunity.Currencytype(item.Currencytype);
             BusinessOpportunity.contactPersonId(item.contactPersonId)
             BusinessOpportunity.contactPersonActionId(item.contactPersonActionId)
             BusinessOpportunity.StartDate(item.StartDateString);
             BusinessOpportunity.EndDate(item.EndDateString);
             BusinessOpportunity.EditOpportunity(item.EditOpportunity);
             BusinessOpportunity.IsRecurring(item.IsRecurring);
             BusinessOpportunity.RecurrenceType(item.RecurrenceType);
             ManageRecurrenceType(item.RecurrenceType);
             ManageRecureTypes(item.RecureTypes);
             RecurringCheck();
             BusinessOpportunity.DailyType(item.DailyType);
             BusinessOpportunity.Dailydays(item.Dailydays);
             BusinessOpportunity.WeeklyDays(item.WeeklyDays);
             BusinessOpportunity.Sun(item.Sun);
             BusinessOpportunity.Mon(item.Mon);
             BusinessOpportunity.Tue(item.Tue);
             BusinessOpportunity.Wed(item.Wed);
             BusinessOpportunity.Thu(item.Thu);
             BusinessOpportunity.Fri(item.Fri);
             BusinessOpportunity.Sat(item.Sat);
             BusinessOpportunity.MonthType(item.MonthType);
             BusinessOpportunity.MonthDays(item.MonthDays);
             BusinessOpportunity.MonthlyMonths(item.MonthlyMonths);
             BusinessOpportunity.Monthly_WeekNumber(item.Monthly_WeekNumber);
             BusinessOpportunity.Monthly_WeekDays(item.Monthly_WeekDays);
             BusinessOpportunity.Monthly_Months2(item.Monthly_Months2);
             BusinessOpportunity.YearlyType(item.YearlyType);
             BusinessOpportunity.YearlyMonths(item.YearlyMonths);
             BusinessOpportunity.Yearly_Days(item.Yearly_Days);
             BusinessOpportunity.Yearly_WeekNumber(item.Yearly_WeekNumber);
             BusinessOpportunity.Yearly_WeekDays(item.Yearly_WeekDays);
             BusinessOpportunity.Yearly_Months2(item.Yearly_Months2);
             BusinessOpportunity.RecureTypes(item.RecureTypes);
             BusinessOpportunity.EndAfterDays(item.EndAfterDays);
             BusinessOpportunity.EndByDays(item.EndByDays);
             BusinessOpportunity.ShippingAddressType(item.ShippingAddressType);
             BusinessOpportunity.ShippingStreet(item.ShippingStreet);
             BusinessOpportunity.ShippingCountry(item.ShippingCountry);
             BusinessOpportunity.ShippingState(item.ShippingState);
             BusinessOpportunity.ShippingZipCode(item.ShippingZipCode);
             BusinessOpportunity.BillingAddressType(item.BillingAddressType);
             BusinessOpportunity.BillingStreet(item.BillingStreet);
             BusinessOpportunity.BillingCountry(item.BillingCountry);
             BusinessOpportunity.BillingState(item.BillingState);
             BusinessOpportunity.BillingZipCode(item.BillingZipCode);
             BusinessOpportunity.InvoiceDate(item.InvoiceDateString);
             BusinessOpportunity.InvoiceExpireDate(item.InvoiceExpireString);
             BusinessOpportunity.businessheading('Edit Business Opportunity');
             BusinessOpportunity.Productitems([]);
             $.each(item.productItems, function (index, subitem) {
                 BusinessOpportunity.addmoreproduct(subitem);
             });
             validatebusinessopp();
             BusinessOpportunity.Totalvalue(item.Totalvalue + " " + $("#Currencytype").val());
             $("#add-business-opp-modal").find(":input").removeAttr("disabled", "disabled");
             $("#add-business-opp-modal").find("#moreproducts").show();

             if ($("#EditOpportunity").val() == 1) {
                 $("#OpportunityId").attr("disabled", "disabled");
             }

             $("#ordr_speci [type='button']:eq(0)").attr("style", "width:66px");
             $("#ordr_speci [type='button']:eq(1)").attr("style", "width:62px");
             $("#ordr_speci [type='button']:eq(2)").attr("style", "width:50px");

             $("#add-business-opp-modal").find("#lnkOk").show();
             $("#add-business-opp-modal").modal("show");
         };
        _showClonebusinessopp = function (item) {

            $("#Filestab").hide();
            $("#Files").hide();
            // $("#hdnId").val(item.id);
            _refreshBusinessDatatable();
            _selectedUserId(item.id);
            BusinessOpportunity.id('');
            BusinessOpportunity.OpportunityId('');
            // used to change date format
            //var valueUnwrapped = ko.utils.unwrapObservable(item.NextActionDate);
            //valueUnwrapped = new Date(valueUnwrapped.substr(valueUnwrapped.indexOf("(") + 1, 13) - 0);
            //item.NextActionDate = formatDate(valueUnwrapped, 'MM/dd/yyyy');
            BusinessOpportunity.NextActionDate('');
            BusinessOpportunity.OpportunityName(item.OpportunityName);
            BusinessOpportunity.Note(item.Note);
            BusinessOpportunity.Statustype('');
            BusinessOpportunity.Currencytype('');
            BusinessOpportunity.contactPersonId('')
            BusinessOpportunity.contactPersonActionId('')
            BusinessOpportunity.StartDate('');
            BusinessOpportunity.EndDate('');
            BusinessOpportunity.EditOpportunity(item.EditOpportunity);
            BusinessOpportunity.IsRecurring(item.IsRecurring);
            BusinessOpportunity.RecurrenceType(item.RecurrenceType);
            ManageRecurrenceType(item.RecurrenceType);
            ManageRecureTypes(item.RecureTypes);
            RecurringCheck();
            BusinessOpportunity.DailyType(item.DailyType);
            BusinessOpportunity.Dailydays(item.Dailydays);
            BusinessOpportunity.WeeklyDays(item.WeeklyDays);
            BusinessOpportunity.Sun(item.Sun);
            BusinessOpportunity.Mon(item.Mon);
            BusinessOpportunity.Tue(item.Tue);
            BusinessOpportunity.Wed(item.Wed);
            BusinessOpportunity.Thu(item.Thu);
            BusinessOpportunity.Fri(item.Fri);
            BusinessOpportunity.Sat(item.Sat);
            BusinessOpportunity.MonthType(item.MonthType);
            BusinessOpportunity.MonthDays(item.MonthDays);
            BusinessOpportunity.MonthlyMonths(item.MonthlyMonths);
            BusinessOpportunity.Monthly_WeekNumber(item.Monthly_WeekNumber);
            BusinessOpportunity.Monthly_WeekDays(item.Monthly_WeekDays);
            BusinessOpportunity.Monthly_Months2(item.Monthly_Months2);
            BusinessOpportunity.YearlyType(item.YearlyType);
            BusinessOpportunity.YearlyMonths(item.YearlyMonths);
            BusinessOpportunity.Yearly_Days(item.Yearly_Days);
            BusinessOpportunity.Yearly_WeekNumber(item.Yearly_WeekNumber);
            BusinessOpportunity.Yearly_WeekDays(item.Yearly_WeekDays);
            BusinessOpportunity.Yearly_Months2(item.Yearly_Months2);
            BusinessOpportunity.RecureTypes(item.RecureTypes);
            BusinessOpportunity.EndAfterDays(item.EndAfterDays);
            BusinessOpportunity.EndByDays(item.EndByDays);
            BusinessOpportunity.ShippingAddressType(item.ShippingAddressType);
            BusinessOpportunity.ShippingStreet(item.ShippingStreet);
            BusinessOpportunity.ShippingCountry(item.ShippingCountry);
            BusinessOpportunity.ShippingState(item.ShippingState);
            BusinessOpportunity.ShippingZipCode(item.ShippingZipCode);
            BusinessOpportunity.BillingAddressType(item.BillingAddressType);
            BusinessOpportunity.BillingStreet(item.BillingStreet);
            BusinessOpportunity.BillingCountry(item.BillingCountry);
            BusinessOpportunity.BillingState(item.BillingState);
            BusinessOpportunity.BillingZipCode(item.BillingZipCode);
            BusinessOpportunity.InvoiceDate('');
            BusinessOpportunity.InvoiceExpireDate('');
            BusinessOpportunity.businessheading('Add Business Opportunity');
            BusinessOpportunity.Productitems([]);
            $.each(item.productItems, function (index, subitem) {
                BusinessOpportunity.addmoreproduct(subitem);
            });
            validatebusinessopp();
            $("#add-business-opp-modal").find(":input").removeAttr("disabled", "disabled");
            $("#add-business-opp-modal").find("#moreproducts").show();
            BusinessOpportunity.Totalvalue(item.Totalvalue + " " + $("#Currencytype").val());
            //if ($("#EditOpportunity").val() == 1) {
            //    $("#OpportunityId").attr("disabled", "disabled");
            //}

            $("#ordr_speci [type='button']:eq(0)").attr("style", "width:66px");
            $("#ordr_speci [type='button']:eq(1)").attr("style", "width:62px");
            $("#ordr_speci [type='button']:eq(2)").attr("style", "width:50px");

            $("#add-business-opp-modal").find("#lnkOk").show();
            $("#add-business-opp-modal").modal("show");
        };
        _showDesktopbusinessopp = function (id) {
            $("#Filestab").hide();
            $("#Files").hide();
            $.ajax({
                url: pageResolveURL + "/CRM/CrmDashboard/GetBusinessOpportunityDetail",
                data: {
                    id: id
                },
                type: "POST",
                success: function (item) {
                    $("#Filestab").hide();
                    $("#Files").hide();
                    $("#hdnId").val(item.id);
                    _selectedUserId(item.id);
                    BusinessOpportunity.id(item.id);
                    BusinessOpportunity.OpportunityId(item.OpportunityId);
                    // used to change date format
                    //var valueUnwrapped = ko.utils.unwrapObservable(item.NextActionDate);
                    //valueUnwrapped = new Date(valueUnwrapped.substr(valueUnwrapped.indexOf("(") + 1, 13) - 0);
                    //item.NextActionDate = formatDate(valueUnwrapped, 'MM/dd/yyyy');
                    BusinessOpportunity.NextActionDate(item.NextActionDateString);
                    BusinessOpportunity.OpportunityName(item.OpportunityName);
                    BusinessOpportunity.Note(item.Note);
                    BusinessOpportunity.Statustype(item.Statustype);
                    BusinessOpportunity.Currencytype(item.Currencytype);
                    BusinessOpportunity.contactPersonId(item.contactPersonId)
                    BusinessOpportunity.contactPersonActionId(item.contactPersonActionId)
                    BusinessOpportunity.StartDate(item.StartDateString);
                    BusinessOpportunity.EndDate(item.EndDateString);
                    BusinessOpportunity.EditOpportunity(item.EditOpportunity);
                    BusinessOpportunity.IsRecurring(item.IsRecurring);
                    BusinessOpportunity.RecurrenceType(item.RecurrenceType);
                    ManageRecurrenceType(item.RecurrenceType);
                    ManageRecureTypes(item.RecureTypes);
                    RecurringCheck();
                    BusinessOpportunity.DailyType(item.DailyType);
                    BusinessOpportunity.Dailydays(item.Dailydays);
                    BusinessOpportunity.WeeklyDays(item.WeeklyDays);
                    BusinessOpportunity.Sun(item.Sun);
                    BusinessOpportunity.Mon(item.Mon);
                    BusinessOpportunity.Tue(item.Tue);
                    BusinessOpportunity.Wed(item.Wed);
                    BusinessOpportunity.Thu(item.Thu);
                    BusinessOpportunity.Fri(item.Fri);
                    BusinessOpportunity.Sat(item.Sat);
                    BusinessOpportunity.MonthType(item.MonthType);
                    BusinessOpportunity.MonthDays(item.MonthDays);
                    BusinessOpportunity.MonthlyMonths(item.MonthlyMonths);
                    BusinessOpportunity.Monthly_WeekNumber(item.Monthly_WeekNumber);
                    BusinessOpportunity.Monthly_WeekDays(item.Monthly_WeekDays);
                    BusinessOpportunity.Monthly_Months2(item.Monthly_Months2);
                    BusinessOpportunity.YearlyType(item.YearlyType);
                    BusinessOpportunity.YearlyMonths(item.YearlyMonths);
                    BusinessOpportunity.Yearly_Days(item.Yearly_Days);
                    BusinessOpportunity.Yearly_WeekNumber(item.Yearly_WeekNumber);
                    BusinessOpportunity.Yearly_WeekDays(item.Yearly_WeekDays);
                    BusinessOpportunity.Yearly_Months2(item.Yearly_Months2);
                    BusinessOpportunity.RecureTypes(item.RecureTypes);
                    BusinessOpportunity.EndAfterDays(item.EndAfterDays);
                    BusinessOpportunity.EndByDays(item.EndByDays);
                    BusinessOpportunity.ShippingAddressType(item.ShippingAddressType);
                    BusinessOpportunity.ShippingStreet(item.ShippingStreet);
                    BusinessOpportunity.ShippingCountry(item.ShippingCountry);
                    BusinessOpportunity.ShippingState(item.ShippingState);
                    BusinessOpportunity.ShippingZipCode(item.ShippingZipCode);
                    BusinessOpportunity.BillingAddressType(item.BillingAddressType);
                    BusinessOpportunity.BillingStreet(item.BillingStreet);
                    BusinessOpportunity.BillingCountry(item.BillingCountry);
                    BusinessOpportunity.BillingState(item.BillingState);
                    BusinessOpportunity.BillingZipCode(item.BillingZipCode);
                    BusinessOpportunity.InvoiceDate(item.InvoiceDateString);
                    BusinessOpportunity.InvoiceExpireDate(item.InvoiceExpireString);
                    BusinessOpportunity.businessheading('Edit Business Opportunity');
                    BusinessOpportunity.Productitems([]);
                    $.each(item.productItems, function (index, subitem) {
                        BusinessOpportunity.addmoreproduct(subitem);
                    });
                    validatebusinessopp();
                    _refreshBusinessDatatable();
                    _refreshBusinessActionDatatable();
                    BusinessOpportunity.Totalvalue(item.Totalvalue + " " + $("#Currencytype").val());
                    $("#add-business-opp-modal").find(":input").removeAttr("disabled", "disabled");
                    $("#add-business-opp-modal").find("#moreproducts").show();
                    if ($("#EditOpportunity").val() == 1) {
                        $("#OpportunityId").attr("disabled", "disabled");
                    }
                    $("#add-business-opp-modal").find("#lnkOk").show();
                    $("#add-business-opp-modal").modal("show");
                }
            });
        };

        _blankbusinessopp = function (item) {
            BusinessOpportunity.id('');
            BusinessOpportunity.OpportunityId('');
            BusinessOpportunity.NextActionDate('');
            BusinessOpportunity.OpportunityName('');
            BusinessOpportunity.Note('');
            BusinessOpportunity.Statustype('');
            BusinessOpportunity.Currencytype('');
            BusinessOpportunity.Totalvalue('');
            BusinessOpportunity.StartDate('');
            BusinessOpportunity.EndDate('');
            BusinessOpportunity.EditOpportunity('');
            BusinessOpportunity.IsRecurring('');
            BusinessOpportunity.RecurrenceType('Daily');
            RecurringCheck();
            ManageRecurrenceType('Daily');
            ManageRecureTypes('noenddate');
            BusinessOpportunity.DailyType('');
            BusinessOpportunity.Dailydays('');
            BusinessOpportunity.WeeklyDays('');
            BusinessOpportunity.Sun('');
            BusinessOpportunity.Mon('');
            BusinessOpportunity.Tue('');
            BusinessOpportunity.Wed('');
            BusinessOpportunity.Thu('');
            BusinessOpportunity.Fri('');
            BusinessOpportunity.Sat('');
            BusinessOpportunity.MonthType('');
            BusinessOpportunity.MonthDays('');
            BusinessOpportunity.MonthlyMonths('');
            BusinessOpportunity.Monthly_WeekNumber('');
            BusinessOpportunity.Monthly_WeekDays('');
            BusinessOpportunity.Monthly_Months2('');
            BusinessOpportunity.YearlyType('');
            BusinessOpportunity.YearlyMonths('');
            BusinessOpportunity.Yearly_Days('');
            BusinessOpportunity.Yearly_WeekNumber('');
            BusinessOpportunity.Yearly_WeekDays('');
            BusinessOpportunity.Yearly_Months2('');
            BusinessOpportunity.RecureTypes('noenddate');
            BusinessOpportunity.EndAfterDays('');
            BusinessOpportunity.EndByDays('');
            BusinessOpportunity.DueDate1("");
            BusinessOpportunity.Comment("");
            BusinessOpportunity.AddAction("");
            BusinessOpportunity.Priority("");
            BusinessOpportunity.RelatedTo("");
            BusinessOpportunity.ActionType("");
            BusinessOpportunity.Currencytype("");
            BusinessOpportunity.AddAction("");
            BusinessOpportunity.Priority("");
            BusinessOpportunity.AssignedTo("");
            BusinessOpportunity.Status("");
            BusinessOpportunity.Status("");
            BusinessOpportunity.Status("");
            BusinessOpportunity.InvoiceDate("");
            BusinessOpportunity.InvoiceExpireDate("");
            BusinessOpportunity.BusinessOpportunityId("");
            BusinessOpportunity.contactPersonId("");
            BusinessOpportunity.contactPersonActionId('')
            _refreshBusinessDatatable();
            _refreshBusinessActionDatatable();
            BusinessOpportunity.businessheading('Add New Business Opportunity');
            BusinessOpportunity.Productitems([]);
            BusinessOpportunity.addmoreproduct([new ProductItem(null, item.Article, item.Product, item.Description, item.vat, item.Units, item.UnitsType, item.Discount, item.DiscountType, item.Price, item.Sum)]);
            BusinessOpportunity.ShippingAddressType($("#hdnShippingAddressType").val());
            BusinessOpportunity.ShippingStreet($("#hdnShippingStreet").val());
            BusinessOpportunity.ShippingCountry($("#hdnShippingCountry").val());
            BusinessOpportunity.ShippingState($("#hdnShippingState").val());
            BusinessOpportunity.ShippingZipCode($("#hdnShippingZipCode").val());
            BusinessOpportunity.BillingAddressType($("#hdnBillingAddressType").val());
            BusinessOpportunity.BillingStreet($("#hdnBillingStreet").val());
            BusinessOpportunity.BillingCountry($("#hdnBillingCountry").val());
            BusinessOpportunity.BillingState($("#hdnBillingState").val());
            BusinessOpportunity.BillingZipCode($("#hdnBillingZipCode").val());
            UnValidate();
            $("#add-business-opp-modal").find(":input").removeAttr("disabled");
            $("#add-business-opp-modal").find("#lnkOk").show();
            $("#add-business-opp-modal").find("#moreproducts").show();
            $("#OpportunityId").attr("disabled", "disabled");
            $("#add-business-opp-modal").find("select").val(0);
            $(".selectpicker").selectpicker('refresh');

            $("#ordr_speci [type='button']:eq(0)").attr("style", "width:66px");
            $("#ordr_speci [type='button']:eq(1)").attr("style", "width:62px");
            $("#ordr_speci [type='button']:eq(2)").attr("style", "width:50px");
            CurrencyChange();
            $("#Filestab").hide();
            $("#Files").hide();
        };

        ////************* End Business Oppertunity ********************************************

        ///***********************Start Ticketing Details**********************************

        var
                _tableTicketSelector = "#accountTicketingDetails-list",
                _tableTicket = null;

        _getDataTicketingDetails = function (options, callback) {
            $.ajax({
                url: pageResolveURL + "/CRM/Crm/TicketingDetailsList",
                data: ko.toJSON(options),
                type: "POST",
                contentType: "application/json charset=utf-8",
                dataType: "json",
                success: function (response, textStatus, jqXHR) {

                    callback(response.data);
                }
            });

        }
        ///***********************End Ticketing details ***********************************

        ///Start Bind Business Opportunity Files
        var
              _tableBusinessFilesSelector = "#businessOppFiles-list",
              _tableBusinessFiles = null;

        self.id = ko.observable("");
        self.FileName = ko.observable("");
        self.CreatedDate = ko.observable("");
        self.Type = ko.observable("");
        var BusinessOpportunityFiles = {
            id: self.id,
            FileName: self.FileName,
            CreatedDate: self.CreatedDate,
            Type: self.Type
        }
        _downloadBopfile = function (item) {

            window.open(pageResolveURL + "/Uploads/Business Opportunity/" + item.Filename + ".pdf");
        },
        _getBopFilesData = function (options, callback) {
            if ($("#hdnId").val() != null) {
                $.ajax({
                    url: pageResolveURL + "/CRM/Crm/BusinessOpportunityFilesList?id=" + $("#hdnId").val(),
                    data: ko.toJSON(options),
                    type: "POST",
                    contentType: "application/json charset=utf-8",
                    dataType: "json",
                    success: function (response, textStatus, jqXHR) {
                        callback(response.data);
                    }
                });
            }

        };
        ///End Business Opportunity Files
        ////************* started Action ********************************************

        //used for add common action
        var $dropdownName = $(this).find('#RelatedToName'),
            $dropdownTo = $(this).find('#RelatedTo');

        //$dropdownTo.change(function () {
        //    //alert(dropdownName.val());

        //    //if ($dropdownName.val() != 'Lead') {
        //    //    $dropdownTo.removeAttr('disabled');
        //    //} else {
        //    //    $dropdownTo.attr('disabled', 'disabled').val('');
        //    //}
        //}).trigger('change'); // added trigger to calculate initial state


        var
           submitted = false,
           _tableSelectoraction = "#Accounts-Action-list",
           _tableaction = null;
        self.id = ko.observable("");
        self.AddAction = ko.observable("");
        self.Status = ko.observable("");
        self.AssignedTo = ko.observable("");
        self.RelatedTo = ko.observable("");
        self.Priority = ko.observable("");
        self.DueDate = ko.observable("");
        self.Comment = ko.observable("");
        self.ActionType = ko.observable("");
        self.BusinessOpportunityId = ko.observable("");
        self.ContactPersonId = ko.observable("");
        self.actionheading = ko.observable("");
        self.RelatedToName = ko.observable("");
        self.InvoiceDate = ko.observable("");
        self.InvoiceExpireDate = ko.observable("");
        self.BusinessOpportunityId("");
        self.contactPersonId("");
        self.contactPersonActionId('')
        //The Object which stored data entered in the observables
        var CompanyActionData = {
            id: self.id,
            AddAction: self.AddAction,
            Status: self.Status,
            AssignedTo: self.AssignedTo,
            RelatedTo: self.RelatedTo,
            Priority: self.Priority,
            DueDate: self.DueDate,
            Comment: self.Comment,
            ActionType: self.ActionType,
            BusinessOpportunityId: self.BusinessOpportunityId,
            ContactPersonId: self.ContactPersonId,
            actionheading: self.actionheading,
            RelatedToName: self.RelatedToName
            //InvoiceDate: self.InvoiceDate,
            //InvoiceExpireDate: self.InvoiceExpireDate,
        };
        self.changerelatedto = function () {
            //if ($('#RelatedTo').attr('value') == "General") {
            //    $('#businessdropdown').attr('id', 'businessdropdown').hide();
            //    $('#contactpersondropdown').attr('id', 'contactpersondropdown').hide();
            //}
            //else if ($('#RelatedTo').attr('value') == "Contact person") {

            //    $('#businessdropdown').attr('id', 'businessdropdown').hide();
            //    //$('#contactpersondropdown').attr('id', 'contactpersondropdown').find('#ContactPersonName').removeClass('selectpicker');
            //    $('#contactpersondropdown').attr('id', 'contactpersondropdown').show();




            //}
            //else if ($('#RelatedTo').attr('value') == "Business opportunity") {
            //    $('#businessdropdown').attr('id', 'businessdropdown').show();
            //    $('#contactpersondropdown').attr('id', 'contactpersondropdown').hide();
            //}
        }
        //Function to perform POST (insert action) operation
        self.saveaction = function () {
            if ($(".headerpopup").text().toLowerCase() == "edit action" && $("#EditPermission").val() == "false") {
                c4u.alerts.error('You do not have permission to edit others account action');
                $("#add-action-modal").modal("hide");
                return;
            }
            if (validateaction()) {
                var DateNew = new Date($("#DueDate").val());
                if (parseInt(new Date().getTimezoneOffset()) < 0) {
                    DateNew.setMinutes(DateNew.getMinutes() - new Date().getTimezoneOffset());
                }
                else {
                    DateNew.setMinutes(DateNew.getMinutes() + new Date().getTimezoneOffset());
                }
                $("#add-action-modal").modal("hide");
                CompanyActionData.DueDate(DateNew);
                CompanyActionData.ContactPersonId($('#ContactPersonId').val());
                $.ajax({
                    type: "POST",
                    url: pageResolveURL + "/Crm/Crm/AddAccountAction?type=" + "account",
                    data: ko.toJSON(CompanyActionData), //Convert the Observable Data into JSON
                    contentType: "application/json",
                    success: function (result) {
                        $("#ActionList").html('');
                        var markup = '';
                        if (result.accountActionList.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.accountActionList.length; x++) {
                                markup += "<option value='" + result.accountActionList[x].id + "'>" + result.accountActionList[x].AddAction + "</option>";
                            }
                        }
                        $("#ActionList").html(markup);

                        $("#ContactPersonId").html('');
                        var markup1 = '';
                        if (result.accountContactList.length > 0) {
                            markup1 += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.accountContactList.length; x++) {
                                markup1 += "<option value='" + result.accountContactList[x].id + "'>" + result.accountContactList[x].firstName + " " + result.accountContactList[x].lastName + "</option>";
                            }
                        }
                        $("#ContactPersonId").html(markup1);

                        $("#nxt_act").find("#ContactPersonIds").html('');
                        var markup1 = '';
                        if (result.accountContactList.length > 0) {
                            markup1 += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.accountContactList.length; x++) {
                                markup1 += "<option value='" + result.accountContactList[x].id + "'>" + result.accountContactList[x].firstName + " " + result.accountContactList[x].lastName + "</option>";
                            }
                        }
                        $("#nxt_act").find("#ContactPersonIds").html(markup1);
                        $("#nxt_act").find("#ContactPersonIds").selectpicker('refresh');

                        if (result.success == false) {

                            c4u.alerts.error(c4u.msg.ActionSaveError);
                            $(".info").show("slow");
                            $(".info").fadeOut(5000);
                            $("#add-action-modal").modal("show");
                        }
                        else {
                            c4u.alerts.success(c4u.msg.ActionSaveSuccess);

                            $("#ActionList").selectpicker('refresh');
                            $("#ContactPersonId").selectpicker('refresh');
                            _refreshactionDatatable();
                            _refreshcontactDatatable();
                            $("#add-action-modal").modal("hide");
                        }
                    },
                    error: function () {
                        c4u.alerts.error(c4u.msg.ActionSaveError);
                        $("#add-action-modal").modal("show");
                    }
                });
            }
        };

        _deleteaccountaction = function (item) {
            if (confirm("Are you sure want to delete?")) {
                $.post(pageResolveURL + "/CRM/Crm/DeleteAction", { id: item.id }, function (result) {

                    if (result.success) {

                        c4u.alerts.success(c4u.msg.ActionDeleteSuccess);

                        $("#ActionList").html('');
                        var markup = '';
                        if (result.AcccountActionVMlist.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.AcccountActionVMlist.length; x++) {
                                markup += "<option value='" + result.AcccountActionVMlist[x].id + "'>" + result.AcccountActionVMlist[x].AddAction + "</option>";
                            }
                        }
                        $("#ActionList").html(markup);
                        $("#ActionList").selectpicker('refresh');


                        $("#ContactPersonId").html('');
                        var markup1 = '';
                        if (result.ContactName.length > 0) {
                            markup1 += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.ContactName.length; x++) {
                                markup1 += "<option value='" + result.ContactName[x].Value + "'>" + result.ContactName[x].Text + "</option>";
                            }
                        }

                        $("#ContactPersonId").html(markup1);
                        $("#ContactPersonId").selectpicker('refresh');

                        $("#nxt_act").find("#ContactPersonIds").html('');
                        var markup1 = '';
                        if (result.ContactName.length > 0) {
                            markup1 += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.ContactName.length; x++) {
                                markup1 += "<option value='" + result.ContactName[x].Value + "'>" + result.ContactName[x].Text + "</option>";
                            }
                        }

                        $("#nxt_act").find("#ContactPersonIds").html(markup1);
                        $("#nxt_act").find("#ContactPersonIds").selectpicker('refresh');
                        _refreshcontactDatatable();
                        _refreshactionDatatable();
                        $('.spinnermodal').hide();
                    }
                    else {
                        c4u.alerts.error(c4u.msg.ActionDeleteError);
                        $('.spinnermodal').hide();
                    }
                });
            }
            else {
                return false;
            }
        },
         _showaccountcontact = function (item) {
             $.post(pageResolveURL + "/CRM/Crm/ShowAccountContact", { Id: item.ContactPersonId }, function (result) {
                 if (result) {
                     $.each(result, function (index, element) {
                         CompanyAccountData.id(element.id);
                         CompanyAccountData.firstName(element.firstName);
                         CompanyAccountData.lastName(element.lastName);
                         CompanyAccountData.telephonenumber(element.telephonenumber);
                         CompanyAccountData.title(element.title);
                         CompanyAccountData.email(element.email);
                         CompanyAccountData.action(element.action);
                         CompanyAccountData.contactheading('Contact Details');
                         validatecontact();

                         $(".selectpicker").selectpicker('refresh');

                         $("#add-contact-modal").find(".close").removeAttr("disabled");
                         // $("#add-contact-modal").find(":input").attr("disabled", "disabled");
                         $("#add-contact-modal").find('#submitcontact').hide();
                         $("#add-contact-modal").modal("show");
                     });
                 }
             });
         },
           _showaccountBussinessOpportunity = function (item) {
               $.post(pageResolveURL + "/CRM/Crm/ShowBussinessOpportunity", { Id: item.BusinessOpportunityId }, function (result) {
                   if (result) {
                       $.each(result, function (index, element) {
                           $("#hdnId").val(item.BusinessOpportunityId)
                           BusinessOpportunity.id(element.id);
                           BusinessOpportunity.OpportunityId(element.OpportunityId);
                           // used to change date format
                           var valueUnwrapped = ko.utils.unwrapObservable(element.NextActionDate);
                           valueUnwrapped = new Date(valueUnwrapped.substr(valueUnwrapped.indexOf("(") + 1, 13) - 0);
                           element.NextActionDate = formatDate(valueUnwrapped, 'MM/dd/yyyy');
                           // used to change format for startdate
                           var valueUnwrappedStartDate = ko.utils.unwrapObservable(element.StartDate);
                           valueUnwrappedStartDate = new Date(valueUnwrappedStartDate.substr(valueUnwrappedStartDate.indexOf("(") + 1, 13) - 0);
                           element.StartDate = formatDate(valueUnwrappedStartDate, 'MM/dd/yyyy');
                           // used to change date format
                           var valueUnwrappedEndDate = ko.utils.unwrapObservable(element.EndDate);
                           valueUnwrappedEndDate = new Date(valueUnwrappedEndDate.substr(valueUnwrappedEndDate.indexOf("(") + 1, 13) - 0);
                           element.EndDate = formatDate(valueUnwrappedEndDate, 'MM/dd/yyyy');
                           BusinessOpportunity.NextActionDate(element.NextActionDate);
                           BusinessOpportunity.OpportunityName(element.OpportunityName);
                           BusinessOpportunity.Note(element.Note);
                           BusinessOpportunity.Statustype(element.Statustype);
                           BusinessOpportunity.Currencytype(element.Currencytype);
                           BusinessOpportunity.Totalvalue(element.Totalvalue);
                           BusinessOpportunity.StartDate(element.StartDate);
                           BusinessOpportunity.EndDate(element.EndDate);
                           BusinessOpportunity.IsRecurring(element.IsRecurring);
                           BusinessOpportunity.RecurrenceType(element.RecurrenceType);
                           BusinessOpportunity.EditOpportunity(element.EditOpportunity);
                           ManageRecurrenceType(element.RecurrenceType);
                           ManageRecureTypes(element.RecureTypes);
                           RecurringCheck();
                           BusinessOpportunity.DailyType(element.DailyType);
                           BusinessOpportunity.Dailydays(element.Dailydays);
                           BusinessOpportunity.WeeklyDays(element.WeeklyDays);
                           BusinessOpportunity.Sun(element.Sun);
                           BusinessOpportunity.Mon(element.Mon);
                           BusinessOpportunity.Tue(element.Tue);
                           BusinessOpportunity.Wed(element.Wed);
                           BusinessOpportunity.Thu(element.Thu);
                           BusinessOpportunity.Fri(element.Fri);
                           BusinessOpportunity.Sat(element.Sat);
                           BusinessOpportunity.MonthType(element.MonthType);
                           BusinessOpportunity.MonthDays(element.MonthDays);
                           BusinessOpportunity.MonthlyMonths(element.MonthlyMonths);
                           BusinessOpportunity.Monthly_WeekNumber(element.Monthly_WeekNumber);
                           BusinessOpportunity.Monthly_WeekDays(element.Monthly_WeekDays);
                           BusinessOpportunity.Monthly_Months2(element.Monthly_Months2);
                           BusinessOpportunity.YearlyType(element.YearlyType);
                           BusinessOpportunity.YearlyMonths(element.YearlyMonths);
                           BusinessOpportunity.Yearly_Days(element.Yearly_Days);
                           BusinessOpportunity.Yearly_WeekNumber(element.Yearly_WeekNumber);
                           BusinessOpportunity.Yearly_WeekDays(element.Yearly_WeekDays);
                           BusinessOpportunity.Yearly_Months2(element.Yearly_Months2);
                           BusinessOpportunity.RecureTypes(element.RecureTypes);
                           BusinessOpportunity.EndAfterDays(element.EndAfterDays);
                           BusinessOpportunity.EndByDays(element.EndByDays);
                           BusinessOpportunity.ShippingAddressType(element.ShippingAddressType);
                           BusinessOpportunity.ShippingStreet(element.ShippingStreet);
                           BusinessOpportunity.ShippingCountry(element.ShippingCountry);
                           BusinessOpportunity.ShippingState(element.ShippingState);
                           BusinessOpportunity.ShippingZipCode(element.ShippingZipCode);
                           BusinessOpportunity.BillingAddressType(element.BillingAddressType);
                           BusinessOpportunity.BillingStreet(element.BillingStreet);
                           BusinessOpportunity.BillingCountry(element.BillingCountry);
                           BusinessOpportunity.BillingState(element.BillingState);
                           BusinessOpportunity.BillingZipCode(element.BillingZipCode);
                           BusinessOpportunity.businessheading('Business Opportunity Details');
                           BusinessOpportunity.Productitems([]);
                           $.each(element.productItems, function (index, subitem) {
                               BusinessOpportunity.addmoreproduct(subitem);
                           });
                           validatebusinessopp();
                           _refreshBusinessDatatable();
                           _refreshBusinessActionDatatable();
                           $("#add-business-opp-modal").find(":input").attr("disabled", "disabled");
                           $("#add-business-opp-modal").find(".close").removeAttr('disabled');
                           $("#add-business-opp-modal").find("#lnkOk").hide();
                           $("#add-business-opp-modal").find("#moreproducts").hide();
                           $("#add-business-opp-modal").modal("show");
                       });
                   }
               });
           },

          _getDataaction = function (options, callback) {
              $.ajax({
                  url: pageResolveURL + "/CRM/Crm/AccountActionList",
                  data: ko.toJSON(options),
                  type: "POST",
                  contentType: "application/json charset=utf-8",
                  dataType: "json",
                  success: function (response, textStatus, jqXHR) {
                      callback(response.data);
                  }
              });
          },

        //Get task data according a lead 
         _getActionData = function (options, callback) {
             $.ajax({
                 url: pageResolveURL + "/CRM/CrmLead/ActionList",
                 data: ko.toJSON(options),
                 type: "POST",
                 contentType: "application/json charset=utf-8",
                 dataType: "json",
                 success: function (response, textStatus, jqXHR) {
                     callback(response.data);
                 }
             });
         },
          _BlankFields = function () {

              CompanyActionData.id('');
              CompanyActionData.AddAction('');
              CompanyActionData.Status('');
              CompanyActionData.DueDate('');
              CompanyActionData.AssignedTo('');
              CompanyActionData.RelatedTo('');
              CompanyActionData.Priority('');
              CompanyActionData.Comment('');
              CompanyActionData.ActionType('');
              CompanyActionData.BusinessOpportunityId('');
              CompanyActionData.ContactPersonId('');
              CompanyActionData.CreatedBy('-1');
              $("#TypeId").val(0);
              $("#AccountId").val(0);
              $("#TypeId").selectpicker('refresh');
              $("#AccountId").selectpicker('refresh');
              $('#actionDivId').html('');
              //$("#add-action-modal").modal("show");
          },
        //_showActionEdit = function (item) {
        //    window.location = pageResolveURL + "/CRM/crm/AddActionCommon/" + item.id;
        //},

        //// Show Desktop Action
        _showDesktopAction = function (Id) {
            _selectedUserId(Id);
            CompanyActionData.id('');
            $("#ActionIdHidden").val(Id);
            $.ajax({
                url: pageResolveURL + "/CRM/Crm/GetActionDetailDashboard",
                data: {
                    id: Id
                },
                type: "POST",
                success: function (response) {
                    var item = response.ActionDetail;
                    _selectedUserId(Id);
                    CompanyActionData.id(Id);
                    CompanyActionData.AddAction(item.AddAction);
                    CompanyActionData.Status(item.Status);
                    // used to change date format
                    var valueUnwrapped = ko.utils.unwrapObservable(item.DueDate);
                    valueUnwrapped = new Date(valueUnwrapped.substr(valueUnwrapped.indexOf("(") + 1, 13) - 0);
                    item.DueDate = formatDate(valueUnwrapped, 'MM/dd/yyyy');
                    CompanyActionData.DueDate(item.DueDate);
                    CompanyActionData.AssignedTo(item.AssignedTo);
                    CompanyActionData.RelatedTo(item.RelatedTo);
                    CompanyActionData.Priority(item.Priority);
                    CompanyActionData.Comment(item.Comment);
                    CompanyActionData.ActionType(item.ActionType);
                    CompanyActionData.BusinessOpportunityId(item.BusinessOpportunityId);
                    CompanyActionData.ContactPersonId(item.ContactPersonId);
                    CompanyActionData.actionheading("Edit Action");
                    CompanyActionData.CreatedBy(item.CreatedBy);
                    $(".selectpicker").selectpicker('refresh');
                    $("#add-action-modal").modal("show");
                    $("#add-action-modal").find("#AddAction").css("width", "207px");
                    $("#add-action-modal").find("#DueDate").css("width", "207px");
                    $("#ContactPersonId").html('');
                    $("#BusinessOpportunityId").html('');

                    //$.post(pageResolveURL + "/CRM/Crm/ShowDashboardContactDetail", { id: item.ContactPersonId, Accountdetail: item.id, AccountList: "" }, function (result) {

                    //    $("#BusinessOpportunityId").html('');

                    //    if (result.success) {


                    var markup = '';

                    if (response.ContactName.length > 0) {
                        markup += "<option value='0'>Select Contact</option>";
                        for (var x = 0; x < response.ContactName.length; x++) {
                            markup += "<option value='" + response.ContactName[x].Value + "'>" + response.ContactName[x].Text + "</option>";
                        }
                    }
                    $("#ContactPersonId").html(markup);


                    $("#ContactPersonId").val(item.ContactPersonId);
                    $("#ContactPersonId").selectpicker('refresh');





                    //$.post(pageResolveURL + "/CRM/Crm/ShowDashboardBussinessDetail", { id: item.BusinessOpportunityId, Accountdetail: item.id, AccountList: "" }, function (result) {
                    //    $("#BusinessOpportunityId").html('');

                    //    if (result.success) {

                    $("#BusinessOpportunityId").html('');
                    var markup1 = '';
                    if (response.OpportunityDNameDash.length > 0) {
                        markup1 += "<option value='0'>Select Bussiness</option>";
                        for (var x = 0; x < response.OpportunityDNameDash.length; x++) {
                            markup1 += "<option value='" + response.OpportunityDNameDash[x].Value + "'>" + response.OpportunityDNameDash[x].Text + "</option>";
                        }
                    }
                    $("#BusinessOpportunityId").html(markup1);


                    $("#BusinessOpportunityId").val(item.BusinessOpportunityId);
                    $("#BusinessOpportunityId").selectpicker('refresh');



                    //            }
                    //            else {

                    //            }
                    //        });




                    //    }
                    //    else {

                    //    }
                    //});







                }
            });
        },


          _saveDesktopaction = function (item) {

              //if ($(".headerpopup").text().toLowerCase() == "edit action" && $("#EditPermission").val() == "false") {
              //    c4u.alerts.error('You dont have permission to edit others account action');
              //    $("#add-action-modal").modal("hide");
              //    return;
              //}
              //if (validateaction()) {

              testCountDetail = testCountDetail + 1;
              //   CompanyActionData.AddAction($("#AddAction").val());
              //  CompanyActionData.DueDate($("#DueDate").val());

              if (testCountDetail == 1) {
                  $('.spinnermodal').show();
                  CompanyActionData.id(item.id);
                  //CompanyActionData.AddAction(item.AddAction);
                  //CompanyActionData.DueDate(item.DueDate);
                  $.ajax({
                      type: "POST",
                      url: pageResolveURL + "/Crm/Crm/AddDesktopAction?type=account&ActionId=" + $("#ActionIdHidden").val(),
                      // data: ko.toJSON(CompanyActionData), //Convert the Observable Data into JSON
                      data: {
                          id: item.id,
                          AddAction: $("#AddAction").val(),
                          Status: $("#Status").val(),
                          DueDate: $("#DueDate").val(),
                          BusinessOpportunityId: $("#BusinessOpportunityId").val(),
                          AssignedTo: $("#AssignedTo").val(),
                          ContactPersonId: $("#ContactPersonId").val(),
                          ActionType: $("#ActionType").val(),
                          Priority: $("#Priority").val(),
                          Comment: $("#Comment").val()
                      },
                      contentType: "application/json",
                      success: function (response) {

                          if (response.success == false) {
                              c4u.alerts.error(c4u.msg.ActionSaveError);
                              $("#add-action-modal").modal("show");
                          }
                          else {

                              $('#ActionAccountLeadDetail').html('');
                              $('#ActionAccountLeadDetail').html(response.RightColumnContent);
                              $('.spinnermodal').hide();
                              $("#AddActionModel").css("display", "none");
                              _BlankFields();
                              $("#ActionIdHidden").val('');
                              c4u.alerts.success(c4u.msg.ActionSaveSuccess);
                              $("#ActionList").selectpicker('refresh');
                              $("#add-action-modal").modal("hide");
                              $(".modal-backdrop").hide();




                          }
                      },
                      error: function () {
                          c4u.alerts.error(c4u.msg.ActionSaveError);
                          $("#add-action-modal").modal("show");
                      }
                  });


              }
              // }
          };

        ////End Desktop Action


        function UnValidate() {
            $('.cross').hide();
        }

        ////************* End Action ********************************************

        ///*******************BOp Action list**************************************

        var
        submitted = false,
        _tableSelectorBopaction = "#Accounts-ActionBopList",
        _tableBopaction = null;
        self.id = ko.observable("");
        self.AddAction = ko.observable("");
        self.Status = ko.observable("");
        self.AssignedTo = ko.observable("");
        self.RelatedTo = ko.observable("");
        self.Priority = ko.observable("");
        self.DueDate = ko.observable("");
        self.Comment = ko.observable("");
        self.ActionType = ko.observable("");
        self.BusinessOpportunityId = ko.observable("");
        self.ContactPersonId = ko.observable("");
        self.actionheading = ko.observable("");
        self.RelatedToName = ko.observable("");
        self.InvoiceDate = ko.observable("");
        self.InvoiceExpireDate = ko.observable("");
        self.BusinessOpportunityId("");
        self.contactPersonId("");
        self.contactPersonActionId('')
        //The Object which stored data entered in the observables
        var CompanyActionData = {
            id: self.id,
            AddAction: self.AddAction,
            Status: self.Status,
            AssignedTo: self.AssignedTo,
            RelatedTo: self.RelatedTo,
            Priority: self.Priority,
            DueDate: self.DueDate,
            Comment: self.Comment,
            ActionType: self.ActionType,
            BusinessOpportunityId: self.BusinessOpportunityId,
            ContactPersonId: self.ContactPersonId,
            actionheading: self.actionheading,
            RelatedToName: self.RelatedToName
            //InvoiceDate: self.InvoiceDate,
            //InvoiceExpireDate: self.InvoiceExpireDate,
        };

        _getDataBopaction = function (options, callback) {
            $.ajax({
                url: pageResolveURL + "/CRM/Crm/AccountActionListBop?OpportunityId=" + $("#hdnId").val(),
                data: ko.toJSON(options),
                type: "POST",
                contentType: "application/json charset=utf-8",
                dataType: "json",
                success: function (response, textStatus, jqXHR) {
                    callback(response.data);
                }
            });
        };

        ///************************************************************************

        ////************* started Notes ********************************************

        var
         submitted = false,
         _tableSelectornotes = "#accountnotes-list",
         _tablenotes = null;
        self.Title = ko.observable("");
        self.Description = ko.observable("");
        self.id = ko.observable("");
        self.heading = ko.observable("");
        self.CreatorUserId = ko.observable("-1")
        //The Object which stored data entered in the observables
        var CompanyNoteData = {
            id: self.id,
            Title: self.Title,
            Description: self.Description,
            heading: self.heading,
            CreatorUserId: self.CreatorUserId
        };
        _deleteaccountnote = function (item) {
            if (_ALLOW_DELETE_ACCOUNT == 'False' && item.CreatorUserId == parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete notes");
                return false;
            }
            if (_ALLOW_DELETE_OTHER == 'False' && item.CreatorUserId != parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete other notes");
                return false;
            }
            if (confirm("Are you sure want to delete?")) {
                $.post(pageResolveURL + "/CRM/Crm/DeleteNotes", { id: item.id }, function (result) {
                    if (result.success) {
                        _refreshnotesDatatable();
                        c4u.alerts.success(c4u.msg.NoteDeleteSuccess);
                    }
                    else {
                        c4u.alerts.error(c4u.msg.NoteDeleteError);
                    }
                });
            }
            else {
                return false;
            }
        },
        _getNoteData = function (options, callback) {
            $.ajax({
                url: pageResolveURL + "/CRM/Crm/AccountNoteList",
                data: ko.toJSON(options),
                type: "POST",
                contentType: "application/json charset=utf-8",
                dataType: "json",
                success: function (response, textStatus, jqXHR) {
                    callback(response.data);
                }
            });
        },
        _removeNote = function (item) {
            if (item == _users()[0]) {
                c4u.alerts.warning(c4u.msg.cantDeleteAdmin);
            }
            else {
                _users.remove(item);
            }
        },

        _showEditaccountnote = function (item) {
            if (_ALLOW_CANEDITOWNCRMACCOUNT == 'False' && item.CreatorUserId == parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to edit notes");
                return false;
            }
            if (_ALLOW_EDIT_OTHER == 'False' && item.CreatorUserId != parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to edit other notes");
                return false;
            }
            _selectedUserId(item.id);
            CompanyNoteData.heading('Edit Note');
            CompanyNoteData.id(item.id);
            CompanyNoteData.Title(item.Title);
            CompanyNoteData.Description(item.Description);
            validatenote();
            $("#add-note-modal").modal("show");
        },
        _blanknotedata = function () {
            CompanyNoteData.heading('Add New Note');
            CompanyNoteData.id('');
            CompanyNoteData.Title('');
            CompanyNoteData.Description('');
            UnValidate();
        }
        //Function to perform POST (insert Employee) operation
        self.savenote = function () {
            if ($(".headerpopup").text().toLowerCase() == "edit note" && $("#EditPermission").val() == "false") {
                c4u.alerts.error('You do not have permission to edit others account note');
                $("#add-note-modal").modal("hide");
                return;
            }
            if (validatenote()) {
                $.ajax({
                    type: "POST",
                    url: pageResolveURL + "/Crm/Crm/AddAccountNote",
                    data: ko.toJSON(CompanyNoteData), //Convert the Observable Data into JSON
                    contentType: "application/json",
                    success: function (result) {
                        if (result.success == false) {
                            c4u.alerts.error(c4u.msg.NoteSaveSuccess);
                            $("#add-note-modal").modal("show");
                        }
                        else {
                            CompanyNoteData.id('');
                            CompanyNoteData.Title('');
                            CompanyNoteData.Description('');
                            _refreshnotesDatatable();
                            c4u.alerts.success(c4u.msg.NoteSaveSuccess);
                            $("#add-note-modal").modal("hide");
                        }
                    },
                    error: function () {
                        c4u.alerts.error(c4u.msg.NoteSaveError);
                        $("#add-note-modal").modal("show");
                    }
                });
            }
        };

        ////************* ended Notes ********************************************
        ///**************Started File Upload Grid************************************

        var
        submitted = false,
        _tableSelectorfiles = "#FileUploadTemplate-list",
        _tablefiles = null;
        self.id = ko.observable("");
        self.filename = ko.observable("");
        self.DateCreated = ko.observable("");
        self.CreatorUserId = ko.observable("-1");
        //The Object which stored data entered in the observables
        var FileUploadData = {
            id: self.id,
            filename: self.filename,
            DateCreated: self.DateCreated,
            CreatorUserId: self.CreatorUserId
        };
        _getFilesData = function (options, callback) {
            $.ajax({
                url: pageResolveURL + "/CRM/Crm/FileUploadList",
                data: ko.toJSON(options),
                type: "POST",
                contentType: "application/json charset=utf-8",
                dataType: "json",
                success: function (response, textStatus, jqXHR) {
                    callback(response.data);
                }
            });

        },
         _downloadfile = function (item) {
             if (_ALLOW_CANEDITOWNCRMACCOUNT == 'False' && item.CreatorUserId == parseInt(_USER_ID)) {
                 c4u.alerts.error("You are not allowed to view the file");
                 return false;
             }
             if (_ALLOW_EDIT_OTHER == 'False' && item.CreatorUserId != parseInt(_USER_ID)) {
                 c4u.alerts.error("You are not allowed to view the file");
                 return false;
             }
             _selectedUserId(item.id);
             window.open(pageResolveURL + "/" + item.filepath);
         },

        _deletefile = function (item) {
            if (_ALLOW_DELETE_ACCOUNT == 'False' && item.CreatorUserId == parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete uploaded file");
                return false;
            }
            if (_ALLOW_DELETE_OTHER == 'False' && item.CreatorUserId != parseInt(_USER_ID)) {
                c4u.alerts.error("You are not allowed to delete file BY others");
                return false;
            }
            if (confirm("Are you sure want to delete?")) {
                $.post(pageResolveURL + "/CRM/Crm/Deletefile", { id: item.id }, function (result) {
                    if (result.success) {
                        _attachOnSuccess();
                        c4u.alerts.success(c4u.msg.DeleteFile);
                    }
                    else {
                        c4u.alerts.error(c4u.msg.DeleteFileError);
                    }
                });
            }
            else {
                return false;
            }
        };

        ////************* started Action Dashboard Account Action ********************************************

        //used for add common action
        var $dropdownName = $(this).find('#RelatedToName'),
            $dropdownTo = $(this).find('#RelatedTo');

        var
           submitted = false,
           _tableSelectoraccountaction = "#Accounts-Actions",
           _tableaccountaction = null;

        self.id = ko.observable("");
        self.AddAction = ko.observable("");
        self.Status = ko.observable("");
        self.AssignedTo = ko.observable("");
        self.RelatedTo = ko.observable("");
        self.Priority = ko.observable("");
        self.DueDate = ko.observable("");
        self.Comment = ko.observable("");
        self.ActionType = ko.observable("");
        self.BusinessOpportunityId = ko.observable("");
        self.ContactPersonId = ko.observable("");
        self.actionheading = ko.observable("");
        self.RelatedToName = ko.observable("");
        self.InvoiceDate = ko.observable("");
        self.InvoiceExpireDate = ko.observable("");
        self.BusinessOpportunityId("");
        self.contactPersonId("");
        self.contactPersonActionId('')
        //The Object which stored data entered in the observables
        var CompanyAccountActionData = {
            id: self.id,
            AddAction: self.AddAction,
            Status: self.Status,
            AssignedTo: self.AssignedTo,
            RelatedTo: self.RelatedTo,
            Priority: self.Priority,
            DueDate: self.DueDate,
            Comment: self.Comment,
            ActionType: self.ActionType,
            BusinessOpportunityId: self.BusinessOpportunityId,
            ContactPersonId: self.ContactPersonId,
            actionheading: self.actionheading,
            RelatedToName: self.RelatedToName
            //InvoiceDate: self.InvoiceDate,
            //InvoiceExpireDate: self.InvoiceExpireDate,
        };
        self.changerelatedto = function () {
        }
        ////Function to perform POST (insert action) operation
        self.saveaction = function () {
            if ($(".headerpopup").text().toLowerCase() == "edit action" && $("#EditPermission").val() == "false") {
                c4u.alerts.error('You dont have permission to edit others account action');
                $("#add-action-modal").modal("hide");
                return;
            }
            if (validateaction()) {
                var DateNew = new Date($("#DueDate").val());
                if (parseInt(new Date().getTimezoneOffset()) < 0) {

                    DateNew.setMinutes(DateNew.getMinutes() - new Date().getTimezoneOffset());

                }
                else {

                    DateNew.setMinutes(DateNew.getMinutes() + new Date().getTimezoneOffset());
                }

                $("#add-action-modal").modal("hide");
                CompanyActionData.DueDate(DateNew);
                $.ajax({
                    type: "POST",
                    url: pageResolveURL + "/Crm/Crm/AddAccountAction?type=" + "account", // '@Url.Content("~/Crm/Crm/AddContactPartial")',
                    data: ko.toJSON(CompanyActionData), //Convert the Observable Data into JSON
                    contentType: "application/json",
                    success: function (result) {
                        $("#ActionList").html('');
                        var markup = '';
                        if (result.data.length > 0) {
                            markup += "<option value='0'>Select</option>";
                            for (var x = 0; x < result.data.length; x++) {
                                markup += "<option value='" + result.data[x].id + "'>" + result.data[x].AddAction + "</option>";
                            }
                        }
                        $("#ActionList").html(markup);

                        if (result.success == false) {

                            c4u.alerts.error(c4u.msg.ActionSaveError);
                            $(".info").show("slow");
                            $(".info").fadeOut(5000);
                            $("#add-action-modal").modal("show");
                        }
                        else {
                            c4u.alerts.success(c4u.msg.ActionSaveSuccess);
                            _refreshactionDatatable();
                            _refreshcontactDatatable();
                            $("#ActionList").selectpicker('refresh');
                            $("#add-action-modal").modal("hide");
                        }
                    },
                    error: function () {
                        c4u.alerts.error(c4u.msg.ActionSaveError);
                        $("#add-action-modal").modal("show");
                    }
                });
            }
        };

        _deleteaccountaction = function (item) {
            if (confirm("Are you sure want to delete?")) {
                $.post(pageResolveURL + "/CRM/Crm/DeleteAction", { id: item.id }, function (result) {
                    if (result.success) {
                        c4u.alerts.error(c4u.msg.ActionDeleteSuccess);
                        _refreshactionDatatable();
                    }
                    else {
                        c4u.alerts.error(c4u.msg.ActionDeleteError);
                    }
                });
            }
            else {
                return false;
            }
        },
        _showaccountactioncontact = function (item) {
            $.post(pageResolveURL + "/CRM/Crm/ShowAccountContact", { Id: item.ContactPersonId }, function (result) {
                if (result) {
                    $.each(result, function (index, element) {
                        CompanyAccountData.id(element.id);
                        CompanyAccountData.firstName(element.firstName);
                        CompanyAccountData.lastName(element.lastName);
                        CompanyAccountData.telephonenumber(element.telephonenumber);
                        CompanyAccountData.title(element.title);
                        CompanyAccountData.email(element.email);
                        CompanyAccountData.action(element.action);
                        CompanyAccountData.contactheading('Contact Details');
                        validatecontact();
                        $(".selectpicker").selectpicker('refresh');
                        $("#add-contact-modal").find(".close").removeAttr("disabled");
                        $("#add-contact-modal").find(":input").attr("disabled", "disabled");
                        $("#add-contact-modal").find('#submitcontact').hide();
                        $("#add-contact-modal").modal("show");
                    });
                }
            });
        },
          _showaccountactionBussinessOpportunity = function (item) {

              $.post(pageResolveURL + "/CRM/Crm/ShowBussinessOpportunity", { Id: item.BusinessOpportunityId }, function (result) {
                  if (result) {
                      $.each(result, function (index, element) {
                          BusinessOpportunity.id(element.id);
                          BusinessOpportunity.OpportunityId(element.OpportunityId);
                          // used to change date format
                          var valueUnwrapped = ko.utils.unwrapObservable(element.NextActionDate);
                          valueUnwrapped = new Date(valueUnwrapped.substr(valueUnwrapped.indexOf("(") + 1, 13) - 0);
                          element.NextActionDate = formatDate(valueUnwrapped, 'MM/dd/yyyy');
                          // used to change format for startdate
                          var valueUnwrappedStartDate = ko.utils.unwrapObservable(element.StartDate);
                          valueUnwrappedStartDate = new Date(valueUnwrappedStartDate.substr(valueUnwrappedStartDate.indexOf("(") + 1, 13) - 0);
                          element.StartDate = formatDate(valueUnwrappedStartDate, 'MM/dd/yyyy');
                          // used to change date format
                          var valueUnwrappedEndDate = ko.utils.unwrapObservable(element.EndDate);
                          valueUnwrappedEndDate = new Date(valueUnwrappedEndDate.substr(valueUnwrappedEndDate.indexOf("(") + 1, 13) - 0);
                          element.EndDate = formatDate(valueUnwrappedEndDate, 'MM/dd/yyyy');
                          BusinessOpportunity.NextActionDate(element.NextActionDate);
                          BusinessOpportunity.OpportunityName(element.OpportunityName);
                          BusinessOpportunity.Note(element.Note);
                          BusinessOpportunity.Statustype(element.Statustype);
                          BusinessOpportunity.Currencytype(element.Currencytype);
                          BusinessOpportunity.Totalvalue(element.Totalvalue);
                          BusinessOpportunity.StartDate(element.StartDate);
                          BusinessOpportunity.EndDate(element.EndDate);
                          BusinessOpportunity.IsRecurring(element.IsRecurring);
                          BusinessOpportunity.RecurrenceType(element.RecurrenceType);
                          BusinessOpportunity.EditOpportunity(element.EditOpportunity);
                          ManageRecurrenceType(element.RecurrenceType);
                          ManageRecureTypes(element.RecureTypes);
                          RecurringCheck();
                          BusinessOpportunity.DailyType(element.DailyType);
                          BusinessOpportunity.Dailydays(element.Dailydays);
                          BusinessOpportunity.WeeklyDays(element.WeeklyDays);
                          BusinessOpportunity.Sun(element.Sun);
                          BusinessOpportunity.Mon(element.Mon);
                          BusinessOpportunity.Tue(element.Tue);
                          BusinessOpportunity.Wed(element.Wed);
                          BusinessOpportunity.Thu(element.Thu);
                          BusinessOpportunity.Fri(element.Fri);
                          BusinessOpportunity.Sat(element.Sat);
                          BusinessOpportunity.MonthType(element.MonthType);
                          BusinessOpportunity.MonthDays(element.MonthDays);
                          BusinessOpportunity.MonthlyMonths(element.MonthlyMonths);
                          BusinessOpportunity.Monthly_WeekNumber(element.Monthly_WeekNumber);
                          BusinessOpportunity.Monthly_WeekDays(element.Monthly_WeekDays);
                          BusinessOpportunity.Monthly_Months2(element.Monthly_Months2);
                          BusinessOpportunity.YearlyType(element.YearlyType);
                          BusinessOpportunity.YearlyMonths(element.YearlyMonths);
                          BusinessOpportunity.Yearly_Days(element.Yearly_Days);
                          BusinessOpportunity.Yearly_WeekNumber(element.Yearly_WeekNumber);
                          BusinessOpportunity.Yearly_WeekDays(element.Yearly_WeekDays);
                          BusinessOpportunity.Yearly_Months2(element.Yearly_Months2);
                          BusinessOpportunity.RecureTypes(element.RecureTypes);
                          BusinessOpportunity.EndAfterDays(element.EndAfterDays);
                          BusinessOpportunity.EndByDays(element.EndByDays);
                          BusinessOpportunity.ShippingAddressType(element.ShippingAddressType);
                          BusinessOpportunity.ShippingStreet(element.ShippingStreet);
                          BusinessOpportunity.ShippingCountry(element.ShippingCountry);
                          BusinessOpportunity.ShippingState(element.ShippingState);
                          BusinessOpportunity.ShippingZipCode(element.ShippingZipCode);
                          BusinessOpportunity.BillingAddressType(element.BillingAddressType);
                          BusinessOpportunity.BillingStreet(element.BillingStreet);
                          BusinessOpportunity.BillingCountry(element.BillingCountry);
                          BusinessOpportunity.BillingState(element.BillingState);
                          BusinessOpportunity.BillingZipCode(element.BillingZipCode);
                          BusinessOpportunity.businessheading('Business Opportunity Details');
                          BusinessOpportunity.Productitems([]);
                          $.each(element.productItems, function (index, subitem) {
                              BusinessOpportunity.addmoreproduct(subitem);
                          });
                          validatebusinessopp();
                          $("#add-business-opp-modal").find(":input").attr("disabled", "disabled");
                          $("#add-business-opp-modal").find(".close").removeAttr('disabled');
                          $("#add-business-opp-modal").find("#lnkOk").hide();
                          $("#add-business-opp-modal").find("#moreproducts").hide();
                          $("#add-business-opp-modal").modal("show");
                      });
                  }
              });
          },
         _getDataaccountaction = function (options, callback) {
             $.ajax({
                 url: pageResolveURL + "/CRM/Crm/AccountActionList",
                 data: ko.toJSON(options),
                 type: "POST",
                 contentType: "application/json charset=utf-8",
                 dataType: "json",
                 success: function (response, textStatus, jqXHR) {
                     callback(response.data);
                 }
             });

         },

        ////Get task data according a lead 
        _getAccountActionData = function (options, callback) {
            $.ajax({
                url: pageResolveURL + "/CRM/CrmLead/ActionList",
                data: ko.toJSON(options),
                type: "POST",
                contentType: "application/json charset=utf-8",
                dataType: "json",
                success: function (response, textStatus, jqXHR) {
                    callback(response.data);
                }
            });
        },

      

        ////************* End Dashboard Account Action ********************************************

       _attachOnSuccess = function () {
           _tablefiles.fnDraw();
       }

        ///*******************End file uplaod************************************
        _refreshactionDatatable = function () {
            _tableaction.fnDraw();
        },
          _refreshcontactDatatable = function () {
              _table.fnDraw();
          },

        _refreshAddressDatatable = function () {
            _tableAddress.fnDraw();
        },
         _refreshnotesDatatable = function () {
             _tablenotes.fnDraw();
         },
        _refreshDatatable = function () {
            _tableBusiness.fnDraw();
        },

        _refreshBusinessDatatable = function () {
            _tableBusinessFiles.fnDraw();
        },

        _refreshBusinessActionDatatable = function () {
            _tableBopaction.fnDraw();
        },

          _init = function () {
              _addmoreproduct(new ProductItem(null, "", "", "", "", "", "", "", "", "", ""));
          },

          _afterInit = function () {
              _table = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableSelector)[0]);
              _tableaction = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableSelectoraction)[0]);
              _tablenotes = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableSelectornotes)[0]);
              _tableBusiness = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableBusinessSelector)[0]);
              _tablefiles = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableSelectorfiles)[0]);
              _tableBusinessFiles = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableBusinessFilesSelector)[0]);
              _tableBopaction = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableSelectorBopaction)[0]);
              _tableaccountaction = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableSelectoraccountaction)[0]);
              _tableAddress = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableAddressSelector)[0]);
          };

        _init();

        return {
            removeUser: _removeUser,
            getData: _getData,
            submit: _submit,
            afterInit: _afterInit,
            deleteaccountcontact: _deleteaccountcontact,
            showEditaccountcontact: _showEditaccountcontact,
            save: self.save,
            CompanyAccountData: CompanyAccountData,
            CompanyAddressData: CompanyAddressData,
            showEditaddress: _showEditaddress,
            blankAddressData: _blankAddressData,
            getAddressData: _getAddressData,
            deleteAddress: _deleteAddress,
            saveAddress: _saveAddress,
            removeproduct: _removeproduct,
            addmoreproduct: _addmoreproduct,
            savebusiness: self.savebusiness,
            BusinessOpportunity: BusinessOpportunity,
            getDatabusinessopp: _getDatabusinessopp,
            deletebusinessopp: _deletebusinessopp,
            showEditbusinessopp: _showEditbusinessopp,
            showClonebusinessopp: _showClonebusinessopp,
            changerelatedto: self.changerelatedto,
            getActionData: _getActionData,
            saveaction: self.saveaction,
            CompanyActionData: CompanyActionData,
            deleteaccountaction: _deleteaccountaction,
            getDataaction: _getDataaction,
            getDataBopaction: _getDataBopaction,
            showaccountcontact: _showaccountcontact,
            showaccountBussinessOpportunity: _showaccountBussinessOpportunity,
            //showActionEdit: _showActionEdit,
            showEditaccountaction: _showEditaccountaction,
            deleteaccountnote: _deleteaccountnote,
            CompanyNoteData: CompanyNoteData,
            getNoteData: _getNoteData,
            removeNote: _removeNote,
            showEditaccountnote: _showEditaccountnote,
            blankaction: _blankaction,
            savenote: self.savenote,
            blanknotedata: _blanknotedata,
            blankcontactdata: _blankcontactdata,
            blankbusinessopp: _blankbusinessopp,
            attachOnSuccess: _attachOnSuccess,
            getFilesData: _getFilesData,
            downloadfile: _downloadfile,
            deletefile: _deletefile,
            getBopFilesData: _getBopFilesData,
            downloadBopfile: _downloadBopfile,

            getDataTicketingDetails: _getDataTicketingDetails,
            getDataaccountaction: _getDataaccountaction,
            showDesktopbusinessopp: _showDesktopbusinessopp,
            showDesktopAction: _showDesktopAction,
            saveDesktopaction: _saveDesktopaction,
            BlankFields: _BlankFields
        };
    }
    c4u.vm.accountdetail = new AccountDetailVM();
    ko.applyBindings(c4u.vm.accountdetail, $(c4u.config.selectors.bindingContainer).get(0));
    c4u.vm.accountdetail.afterInit();
});
//----------------------------------------REGION ENDS----------------------------------------------------



/// add these functionality for Recurrence
function ManageRecureTypes(Type) {
    $("#RecureTypesdiv").hide();
    $('#endafter').hide();
    $('#endby').hide();
    switch (Type) {
        case "endafter":
            $("#RecureTypesdiv").show();
            $('#endafter').show();
            break;
        case "endby":
            $("#RecureTypesdiv").show();
            $('#endby').show();
            break;
    }
}

function ManageRecurrenceType(Type) {
    $('#righttable').hide();
    $('#DailyRecurrence').hide();
    $('#WeeklyRecurrence').hide();
    $('#MonthlyRecurrence').hide();
    $('#YearlyRecurrence').hide();
    switch (Type) {
        case "Daily":
            $('#righttable').show();
            $('#DailyRecurrence').show();
            break;
        case "Weekly":
            $('#righttable').show();
            $('#WeeklyRecurrence').show();
            break;
        case "Monthly":
            $('#righttable').show();
            $('#MonthlyRecurrence').show();
            break;
        case "Yearly":
            $('#righttable').show();
            $('#YearlyRecurrence').show();
            break;
    }
}

function RecurringCheck() {
    if ($('#IsRecurring').attr('checked')) {
        $('#recurrencediv').show();
    }
    else {
        $('#recurrencediv').hide();
    }
}

function DailyDayscheck() {
    $("#TextBox_Daily_Days").val(0);
}

function Monthmonthscheck() {
    $("#TextBox_Monthly_Days").val(0);
    $("#TextBox_Monthly_Months").val(0);
}

function MonthTypecheck() {
    $("#TextBox_Monthly_Months_2").val(0);
}

function YearlyMonthsCheck() {
    $("#TextBox_Yearly_Years").val(0);
}

function CheckOpportunityId() {
    if ($.trim($("#OpportunityId").val()) == "") {
        c4u.alerts.error(c4u.msg.AddOpportunityId);
        return;
    }

    $.ajax({
        url: pageResolveURL + "/CRM/Crm/CheckOpportunityId",
        data: {
            OppId: $("#OpportunityId").val(),
            Edit: $("#hiddenOpportunityId").val() == "" ? 0 : $("#hiddenOpportunityId").val()
        },
        type: "POST",
        success: function (response) {
            if (response.data == true) {
                c4u.alerts.error(c4u.msg.OpportunityIdAlert);
                $("#OpportunityId").val('');
                $("#OpportunityId").focus();
            }
        }
    });

}

function EditOpportunityId() {
    if ($("#EditOpportunity").val() == 2) {
        $("#OpportunityId").removeAttr("disabled");
        $("#OpportunityId").focus();

    }
    else {
        $("#OpportunityId").attr("disabled", "disabled");
    }
}

function GenerateInvoicePdf(type) {
    if ($("#hdnId").val() == 0 || $("#hdnId").val() == undefined) {
        c4u.alerts.error("Please save bussiness opportunity");
        return false;
    }
   

    $("body").append('<form id="exportform" action="' + pageResolveURL + '/Print/GenerateInvoicePdf"  method="post" target="_blank"> <input type="hidden" id="id" name="id" value="' + $("#hdnId").val() + '" /><input type="hidden" id="type" name="type" value=' + type + ' /></form>');
    $("#exportform").submit().remove();

    setTimeout(
  function () {
      _refreshBusinessDatatable();
  }, 5000);
}
function CurrencyChange() {
    var currentVal = $("#Currencytype").val();
    $("#mainSection #Sum").each(function () {
        var currentString = $(this).val();
        currentString = currentString.substring(0, currentString.indexOf(" ") + 1);
        $(this).val(currentString + currentVal);
    });
    var currentString1 = $("#Totalvalue").val();
    currentString1 = currentString1.substring(0, currentString1.indexOf(" ") + 1);
    $("#Totalvalue").val(currentString1 + currentVal);
}