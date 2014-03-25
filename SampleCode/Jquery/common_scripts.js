var DomainName = document.domain.toString();
//DomainName = "localhost:50444"; //To test application at local end plz uncomment this line. 
var CDNUrl = 'na.na-assets.com';
returnSerp = '';
searchString = '';
var _browseUrl = 'browse';
var PageActionPrefix = '';
if ($('#ActionPrefix').length > 0) { PageActionPrefix = $('#ActionPrefix').val(); }

var _becomememberpage = "http://" + DomainName + "/SERPBecomeMember?r=" + Math.floor(Math.random() * 10001) + ((returnSerp.length > 0) ? "&rtserp=" + returnSerp : "") + "";
if ($("#hdnpaymenturl").length > 0) { _becomememberpage = "http://" + DomainName + "/SERPBecomeMember?r=" + Math.floor(Math.random() * 10001) + ((returnSerp.length > 0) ? "&rtserp=" + returnSerp : "") + ""; }

function openDialogPhNo() {
    if ($("#hdnclass_wrap").length > 0 && $.trim($("#hdnclass_wrap").val()).toLowerCase() == "premium") { openDefaultPhonePopup("http://" + DomainName + "/DefaultBillingInfoControlPost/DefaultDayPhoneControl", 800, false); }
    else { openDefaultPhonePopup("http://" + DomainName + "/DefaultBillingInfoControlPost/DefaultDayPhoneControl", 800); }
}

function openDefaultPhonePopup(page, custWidth, noClose) {
    if (custWidth == undefined) { popWidth = false; } else { popWidth = custWidth; }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea').height($('body').height()).append(bodyBox);
    $.ajax({
        url: page,
        success: function (data) {
            if (noClose == undefined || noClose == true) {
                bodyBox.html('<div id="divDefaultDayPhone" class="btnClose"></div>' + data);
            } else { bodyBox.html(data); }

            $('body').prepend(popupContainer);
            popupContainer.fadeTo(0, 0);
            popupResize()
            popupContainer.fadeTo(600, 1);
            $('#divDefaultDayPhone').click(function () {
                popupContainer.fadeTo(600, 0, function () {
                    popupContainer.remove();
                    createCookie("Preferences", "PopUpPhone=1", "1");
                });
            })
            if (noClose == undefined || noClose == true) {
                $(document).keypress(function (e) {
                    if (e.keyCode == 27) {
                        popupContainer.fadeTo(600, 0, function () {
                            popupContainer.remove();
                            createCookie("Preferences", "PopUpPhone=1", "1");
                        });
                    };
                });
            }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}
/*=======Debasis20130205=====*/
function openDialogMaintenance() {
    //changed by vishant garg as we have no need to apply if else condition
    // if ($("#hdnclass_wrap").length > 0 && $.trim($("#hdnclass_wrap").val()).toLowerCase() == "premium") {
    setTimeout('openDefaultMaintenancePopup("http://" + DomainName + "/commonpopup/DefaultMaintenanceControl", 800, true)', 25000);
    // }
    //  else { setTimeout('openDefaultMaintenancePopup("http://" + DomainName + "/common/DefaultMaintenanceControl", 800, true)', 25000); }
}

/*=====Add by raju 11/12/2013 started ======*/
function Shareemailbyemail() {
    var publicationtitle = $.trim($('#publicationTitle').val());
    var publicationdate = $.trim($('#publicationDate').val());
    var imageid = $.trim($('#ImageID').val());
    openPopup("http://" + DomainName + "/commonpopup/sharenewspaperbyemail?publicationdate=" + publicationdate + "&publicationtitle=" + publicationtitle + "&imageid=" + imageid + "&r=" + Math.floor(Math.random() * 10001), 800);
}

function ShareNewspaperToMyFriend() {
    var boolreturn = true;
    var regex = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var publicationtitle = $.trim($('#publicationTitle').val());
    var publicationdate = $.trim($('#publicationDate').val());
    var imageid = $.trim($('#ImageID').val());

    var useremailaddress = $.trim($('#UserEmailAddress').val());
    var friendemailaddress = $.trim($('#FriendEmailAddress').val());
    var message = $.trim($('#Message').val());

    if (useremailaddress.length == 0) {
        $('#error_useremail').html("Please provide your email address.");
        $('#UserEmailAddress').focus();
        boolreturn = false;
    } else if (regex.test(useremailaddress) == false) {
        $("#sp_emailaddress").text("Invalid E-mail address.");
        $("UserEmailAddress").focus();
        boolreturn = false;
    }
    if (friendemailaddress.length == 0) {
        $('#error_friendemail').html("Please provide your friend's email address.");
        $('#FriendEmailAddress').focus()
        boolreturn = false;
    } else if (regex.test(friendemailaddress) == false) {
        $("#sp_emailaddress").text("Invalid E-mail address.");
        $("FriendEmailAddress").focus();
        boolreturn = false;
    }
    if (message.length == 0) {
        $('#error_message').html("Message body empty. Please add a message.");
        $("#Message").focus();
        boolreturn = false;
    }
    if (boolreturn) {
        $('#div_message').html("");
        $('#btnSendMail').css("display", "none");
        $('#btnRequest').css("display", "inline");
        $.ajax({
            cache: false,
            type: "POST",
            url: "http://" + DomainName + "/commonpopup/sharenewspaperbyemail",
            data: {
                "publicationDate": publicationdate,
                "publicationTitle": publicationtitle,
                "ImageID": imageid,
                "UserEmailAddress": useremailaddress,
                "FriendEmailAddress": friendemailaddress,
                "Message": message
            },
            success: function (data) {
                if (data == true) {
                    $('#btnSendMail').css("display", "inline");
                    $('#btnRequest').css("display", "none");
                    $('#div_message').html("<div class='alert alert-success'><button data-dismiss='alert' class='close' type='button'>×</button> Email has been sent successfully.</div>");
                    setTimeout(function () { $(".btnClose").trigger("click"); }, 1500);
                }
                else {
                    $('#btnSendMail').css("display", "inline");
                    $('#btnRequest').css("display", "none");
                    $('#div_message').html("<div class='alert alert-error'><button data-dismiss='alert' class='close' type='button'>×</button>Email sent failed please try again later.</div>");
                }
            },
            error: function (ex) {
                $('#btnSendMail').css("display", "inline");
                $('#btnRequest').css("display", "none");
                $('#div_message').html("<div class='alert alert-error'><button data-dismiss='alert' class='close' type='button'>×</button>Email sent failed please try again later.</div>");
            }

        });
    }
    return boolreturn;
}

function EmbedNewspaper() {
    var baseurl = ($("#ViewerBaseURL").length > 0) ? $("#ViewerBaseURL").val() : "";
    openPopup("http://" + DomainName + "/commonpopup/embednewspaper?url=" + baseurl + "&r=" + Math.floor(Math.random() * 10001), 800);
}
/*=====Add by raju 11/12/2013 end ======*/

function openDefaultMaintenancePopup(page, custWidth, noClose) {
    if (custWidth == undefined) { popWidth = false; } else { popWidth = custWidth; }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea').height($('body').height()).append(bodyBox);
    $.ajax({
        url: page,
        success: function (data) {
            if (noClose == undefined || noClose == true) {
                bodyBox.html('<div id="divDefaultMaintenance" class="btnClose"></div>' + data);
            } else { bodyBox.html(data); }

            $('body').prepend(popupContainer);
            popupContainer.fadeTo(0, 0);
            popupResize()
            popupContainer.fadeTo(600, 1);
            $('#divDefaultMaintenance').click(function () {
                popupContainer.fadeTo(600, 0, function () {
                    popupContainer.remove();
                    createCookie("Maintenance", "PopUpMaintenance=1", "1");
                });
            })
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}

function openDialogBillingInfo() {
    if ($("#hdnclass_wrap").length > 0 && $.trim($("#hdnclass_wrap").val()).toLowerCase() == "premium") {
        openDefaultBillingInfoPopup("http://" + DomainName + "/commonpopup/DefaultBillingInfoControl", 900, false);
    }
    else { openDefaultBillingInfoPopup("http://" + DomainName + "/commonpopup/DefaultBillingInfoControl", 900); }
}
function openDefaultBillingInfoPopup(page, custWidth, noClose) {
    if (custWidth == undefined) { popWidth = false; } else { popWidth = custWidth; }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea billingInfoPopup').height($('body').height()).append(bodyBox);

    $.ajax({
        url: page,
        success: function (data) {
            if (noClose == undefined || noClose == true) {
                bodyBox.html('<div id="divDefaultBillingInfo" class="btnClose"></div>' + data);
            } else { bodyBox.html(data); }

            $('body').prepend(popupContainer);
            popupContainer.fadeTo(0, 0);
            popupResize()
            popupContainer.fadeTo(600, 1);
            $("#divDefaultBillingInfo").click(function () {
                popupContainer.fadeTo(600, 0, function () {
                    popupContainer.remove();
                    createCookie("PopUpBillingInfo", "PopUpBillingInfo=1", "7");
                });
            })
            if ($("#divddlstate") != null && $("#hdnUSA") != null) {
                if ($.trim($("#hdnUSA").val()) == "true") {
                    $("#divProvince").css("display", "none");
                    $("#divddlstate").css("display", "block");
                }
                else {
                    $("#divProvince").css("display", "block");
                    $("#divddlstate").css("display", "none");
                }
            }
            if ($("#flag").length > 0 && $("#flag").val() == "0") { $('div.thickBoxArea.billingInfoPopup').css("display", "none"); }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}

function ValidateDefaultBillingInfo(ctrlButtonId, ctrladdress1, ctrladdress2, ctrlphone, ctrlcountry, ctrlcity, ctrlstate, ctrlprovince, ctrlzipcode) {
    // DomainName = "localhost:50444";
    //debugger;
    var Address1 = $("#" + ctrladdress1 + " ").val();
    var Address2 = $("#" + ctrladdress2 + " ").val();
    var PhoneNo = $("#" + ctrlphone + " ").val();
    var Country = $("#" + ctrlcountry + " ").val();
    var City = $("#" + ctrlcity + " ").val();
    var State = $("#" + ctrlstate + " ").val();
    var Province = $("#" + ctrlprovince + " ").val();
    var Zipcode = $("#" + ctrlzipcode + " ").val();

    var _return = true;
    if ($.trim(typeof Address1) == 'undefined' || $.trim(Address1) == "") {
        $('#error_address').html("Street address required.");
        $("#" + ctrladdress1 + " ").focus();
        _return = false;
    }

    if ($.trim(typeof PhoneNo) == 'undefined' || $.trim(PhoneNo) == "") {
        $('#error_telephone').html("Phone number required.");
        $("#" + ctrlphone + " ").focus();
        _return = false;
    }

    if ($.trim(typeof Country) == 'undefined' || $.trim(Country) == "") {
        $('#error_country').html("Country required.");
        $("#" + ctrlstate + " ").focus();
        _return = false;
    }

    if ($.trim(typeof City) == 'undefined' || $.trim(City) == "") {
        $('#error_city').html("City name required.");
        $("#" + ctrlcity + " ").focus();
        _return = false;
    }

    if ($.trim(typeof Zipcode) == 'undefined' || $.trim(Zipcode) == "") {
        $('#error_zipcode').html("Zip code required.");
        $("#" + ctrlzipcode + " ").focus();
        _return = false;
    }

    if ($.trim(Country).toLowerCase() == "us") {
        if ($.trim(typeof State) == 'undefined' || $.trim(State) == "") {
            $('#error_state').html("State name required.");
            _return = false;
        }
    }
    else if ($.trim(Country).toLowerCase() != "us") {
        if ($.trim(typeof Province) == 'undefined' || $.trim(Province) == "") {
            $('#error_province').html("Province name required.");
            $("#" + ctrlprovince + " ").focus();
            _return = false;
        }
    }

    if (_return) {
        var _validateurl = "http://" + DomainName + "/Common/PhoneNumberValidation";
        var URL = "http://" + DomainName + "/DefaultBillingInfoControlPost/DefaultBillingInfoControlPost";
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: { "address1": Address1, "address2": Address2, "phone": PhoneNo, "country": Country, "city": City, "state": State, "province": Province, "zipcode": Zipcode },
            success: function (data) {
                if (data != null && data == "success") {
                    alert('Thank you for submitting your billing info.');

                    var popupContainer = $(".thickBoxArea");
                    popupContainer.fadeTo(600, 0, function () {
                        popupContainer.remove();
                    });

                    var url = "http://" + DomainName;
                    if ($("#cu").length > 0) { url = "http://" + DomainName + $("#cu").val().toLowerCase(); }
                    else if (parent.$("#cu").length > 0) { url = "http://" + DomainName + parent.$("#cu").val().toLowerCase(); }
                    _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'DefailtBillinginfoPopup', 'Billing Info Submit', url, 1]);
                    $("#divDefaultBillingInfo").click();
                }
                else {
                    //alert('Please try again.');
                    alert(data);
                }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            //error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); }
        });
        return _return;
    }
    return _return;
}

function BillingInfoPopUpCountryChange() {
    if ($.trim($("#ddlcountry").val()).toLowerCase() == "us") {
        document.getElementById('divddlstate').style.display = '';
        document.getElementById('divProvince').style.display = 'none';
    } else {
        document.getElementById('divddlstate').style.display = 'none';
        document.getElementById('divProvince').style.display = '';
    }
}

function openDialogBounceEmail(_subScriberKey) {
    if ($("#hdnclass_wrap").length > 0 && $.trim($("#hdnclass_wrap").val()).toLowerCase() == "premium") { openDialogBounceEmailPopup("http://" + DomainName + "/DefaultBillingInfoControlPost/BounceEmailControl?subscriberKey=" + _subScriberKey, 800, false); }
    else { openDialogBounceEmailPopup("http://" + DomainName + "/DefaultBillingInfoControlPost/BounceEmailControl?subscriberKey=" + _subScriberKey, 800); }
}

function openDialogBounceEmailPopup(page, custWidth, noClose) {
    if (custWidth == undefined) { popWidth = false; } else { popWidth = custWidth; }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea').height($('body').height()).append(bodyBox);
    $.ajax({
        url: page,
        success: function (data) {
            if (noClose == undefined || noClose == true) {
                /*//bodyBox.html('<div id="divBounceEmailControl" class="btnClose"></div>' + data);*/
            } else { bodyBox.html(data); }
            var _popEnable = 0;
            if ($("#hdnclass_wrap").length > 0 && $.trim($("#hdnclass_wrap").val()).toLowerCase() == "premium") {
                bodyBox.html('<div id="divBounceEmailControl" class="btnClose"></div>' + data);
                _popEnable = 1;
            }
            else {
                bodyBox.html('<div id="divBounceEmailControl" class="btnClose hidden"></div>' + data);
            }
            $('body').prepend(popupContainer);
            popupContainer.fadeTo(0, 0);
            popupResize()
            popupContainer.fadeTo(600, 1);
            $('#divBounceEmailControl').click(function () {
                popupContainer.fadeTo(600, 0, function () {
                    popupContainer.remove();
                    createCookie("BounceEmail", "PopUpBounceEmail=" + _popEnable, "1");
                });
            })
            if (noClose == undefined || noClose == true) {
                $(document).keypress(function (e) {
                    if (e.keyCode == 27) {
                        popupContainer.fadeTo(600, 0, function () {
                            popupContainer.remove();
                            createCookie("BounceEmail", "PopUpBounceEmail=" + _popEnable, "1");
                        });
                    };
                });
            }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}

function ValidateBounceEmail(ctrlButtonId, ctrlKeyword) {
    var textbox = $("#" + ctrlKeyword + " ").val();
    var subscriberKey = $("#SubscriberKey").val();
    if ($.trim(typeof textbox) == 'undefined' || $.trim(textbox) == "")
    { alert('Please enter your valid email address'); }
    else {
        var _validateurl = "http://" + DomainName + "/Common/BounceEmailValidation";
        var URL = "http://" + DomainName + "/DefaultBillingInfoControlPost/BounceEmailControlPost";
        //$.ajax({
        //    cache: false,
        //    type: "GET",
        //    url: _validateurl,
        //    data: { "emailaddress": textbox },
        //    success: function (data) {
        //        if (data != null && $.trim(data.Message) == "false") { alert("Please enter valid email address."); }
        //        else if (data != null && $.trim(data.Message) == "true") {
        //       } else { alert('Failed, please try again later.'); }
        //    },
        //    error: function (ex) {
        //        ExceptionHandling(ex);
        //    }
        //    //error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); }
        //});
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,

            data: { "emailaddress": textbox, "subscriberKey": subscriberKey },
            success: function (data) {
                if (data != null && data == "success") {
                    alert('Thank you for submitting your valid email address.');
                    var popupContainer = $(".thickBoxArea");
                    popupContainer.fadeTo(600, 0, function () {
                        popupContainer.remove();
                    });

                    var url = "http://" + DomainName;
                    if ($("#cu").length > 0) { url = "http://" + DomainName + $("#cu").val().toLowerCase(); }
                    else if (parent.$("#cu").length > 0) { url = "http://" + DomainName + parent.$("#cu").val().toLowerCase(); }
                    _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'BounceEmailPopup', 'Email Address Submit', url, 1]);
                    $("#divBounceEmailControl").click();
                }
                else {
                    alert(data);
                }
                return true;
            },
            error: function (ex) {
                ExceptionHandling(ex);
                return true;
            }
            //error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); }
        });

    }
    return false;
}

function DefaultCreditcard() { if (document.URL == "http://" + DomainName + "/") { openPopup("http://" + DomainName + "/commonpopup/DefaultCreditCardUpdate", 800); } }
/*----------Added by subhendu@20120810 for openrecent popup modal-----*/
function openrecentpopup() { openPopup("http://" + DomainName + "/Weeklyperspective/RecentPostpopup"); }
/*----------Ended by subhendu@20120810 for openrecent popup modal-----*/
/*//*****************************SUJOY****************************************/
function openAllDate() { openPopup("http://" + DomainName + "/Weeklyperspective/SelectAllDatepopup"); }
/*//*****************************Sujoy End************************************/
function SelectPlanRenderLink(id) { var securelink = "https://secure.newspaperarchive.com/RegistrationPaymentV77de.aspx?plan=" + id + "&refpage=original"; window.location.href = securelink; }

//function seems not in use: Rakesh
function RemoveItemFormShopCartdet() {
    var inputs = document.getElementsByName("checking");
    var chec = "";
    var checked = [];
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type == "checkbox") { if (inputs[i].checked) { chec = chec + ',' + inputs[i].value; } }
    }
    if (chec != "") {
        $(document).ready(function () {
            // debugger;
            $('#DivResult').load('http://' + DomainName + '/ShoppingCart/CartRemoveItems?RemoveItem=' + chec + '&random' + Math.floor(Math.random() * 10001));
            if ($("#divShoppingCart").length > 0) { $('#divShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCart?random" + Math.floor(Math.random() * 10001)); }
            if ($("#divShoppingCartNav").length > 0) { $('#divShoppingCartNav').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random" + Math.floor(Math.random() * 10001)); }

            if ($(".ulHeaderShoppingCart").length > 0) { $('.ulHeaderShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random=" + Math.floor(Math.random() * 10001)); }
            if ($(".divMyAccountShoppingCart").length > 0) { $('.divMyAccountShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigationMyAccount?random=" + Math.floor(Math.random() * 10001)); }
        });
    }
    else { alert("Please select atleast one item to remove."); }
}

function RemoveAllItemsFromCart() {
    // debugger;
    $("#CleanCart").click();
    if ($("a.store").length > 0) {
        $("a.store").each(function () {
            var _id = $(this).attr("id").replace("btn_", "");
            $(this).attr('class', 'cart store');
            $(this).attr("href", "javascript:addtoCart(" + _id + ");");
            $(this).text("add to cart");
        });
    }

    if ($("a.repro").length > 0) { $("a.repro").each(function () { var _id = $(this).attr("id").replace("btn_store_", ""); $(this).attr("href", "javascript:addtoCart(" + _id + ");"); }); }
    if ($("div.cartIcon").length > 0) { $("div.cartIcon").each(function () { var _id = $(this).attr("id").replace("ds_", ""); $(this).attr("class", ""); }); }
    /*//parent.location.href="http://" + DomainName + "/store";*/
}



// function  seems not  in use, call commented in View : Rakesh 
function CleanCartNew() {
    //debugger;
    if (confirm('Do you want to remove this item?')) {
        //DomainName = "localhost:50444";
        var URL = "http://" + DomainName + "/ShoppingCartController/CleanCart1";
        $.ajax({
            cache: false,
            type: "POST",
            url: URL,
            //data: { "Result": result },
            success: function (data) { },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            // error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); }

        });
    }
}


function fcnChangeResultsPerPage(ctl) {
    var ctlVal = ctl.value;
    $("#ResultPerPage").val("" + ctlVal + "");
    fcnUpdateResultsPerPage(ctlVal);
}

function fcnUpdateResultsPerPage(value) {
    var date = new Date();
    var today = new Date((date.getFullYear() + 1), date.getMonth(), date.getDate());
    document.cookie = ".newspaperarchive.com/ResultsPerPage=NumResults=" + value + "; expires=" + today.toUTCString() + "; path=/";
}

function initFacebook() {
    window.fbAsyncInit = function () {
        FB.init({
            appId: '137491669688096',
            status: true,
            cookie: true,
            xfbml: true,
            oauth: true,
            channelUrl: DomainName + '/fbchannel.html'
        });
        ELoader.setReady('fb');
        FB.Event.subscribe('edge.create', page_like_callback);
    };

    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
    e.async = true;
    document.getElementById('fb-root').appendChild(e);
}

var page_like_callback = function (url, html_element) {
    var URL = "http://" + DomainName + "/IIPPapersOrganicGoogleViewer/CreateFB_FlagCookie?r=" + Math.floor(Math.random() * 10001);
    $.ajax({
        cache: false,
        type: "GET",
        url: URL,
        data: {},
        success: function (data) {
            if (data != null && data == "Success") {
                window.top.location.href = $(location).attr('href');
            }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}


$(function () {
    if (!$('#fb-root').length) $('body').prepend('<div id="fb-root"></div>');
    ELoader.bind('dom fb', DOMAndFBLoadComplete);

    if ($("a.btnreviseSearch").length > 0) {
        $("a.btnreviseSearch").click(function () {
            $("div.additionalSearch").show("medium");
            $("div.additionalSearch").focus();
        });
    }

    /*------------- lazy loading---------------*/
    (function ($, window) {
        var $window = $(window);
        $.fn.lazyload = function (options) {
            var elements = this;
            var $container;
            var settings = {
                threshold: 0,
                failure_limit: 0,
                event: "scroll",
                effect: "show",
                container: window,
                data_attribute: "original",
                skip_invisible: true,
                appear: null,
                load: null
            };

            function update() {
                var counter = 0;
                elements.each(function () {
                    var $this = $(this);
                    if (settings.skip_invisible && !$this.is(":visible")) {
                        return;
                    }
                    if ($.abovethetop(this, settings) ||
                        $.leftofbegin(this, settings)) {
                        /* Nothing. */
                    } else if (!$.belowthefold(this, settings) &&
                        !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                    } else {
                        if (++counter > settings.failure_limit) {
                            return false;
                        }
                    }
                });
            }
            if (options) {
                if (undefined !== options.failurelimit) {
                    options.failure_limit = options.failurelimit;
                    delete options.failurelimit;
                }
                if (undefined !== options.effectspeed) {
                    options.effect_speed = options.effectspeed;
                    delete options.effectspeed;
                }
                $.extend(settings, options);
            }
            /* Cache container as jQuery as object. */
            $container = (settings.container === undefined ||
                          settings.container === window) ? $window : $(settings.container);

            /* Fire one scroll event per scroll. Not one scroll event per image. */
            if (0 === settings.event.indexOf("scroll")) {
                $container.bind(settings.event, function (event) { return update(); });
            }

            this.each(function () {
                var self = this;
                var $self = $(self);

                self.loaded = false;

                /* When appear is triggered load original image. */
                $self.one("appear", function () {
                    if (!this.loaded) {
                        if (settings.appear) {
                            var elements_left = elements.length;
                            settings.appear.call(self, elements_left, settings);
                        }
                        $("<img />")
                            .bind("load", function () {
                                $self
                                    .hide()
                                    .attr("src", $self.data(settings.data_attribute))
                                    [settings.effect](settings.effect_speed);
                                self.loaded = true;

                                /* Remove image from array so it is not looped next time. */
                                var temp = $.grep(elements, function (element) {
                                    return !element.loaded;
                                });
                                elements = $(temp);

                                if (settings.load) {
                                    var elements_left = elements.length;
                                    settings.load.call(self, elements_left, settings);
                                }
                            })
                            .attr("src", $self.data(settings.data_attribute));
                    }
                });

                /* When wanted event is triggered load original image */
                /* by triggering appear.                              */
                if (0 !== settings.event.indexOf("scroll")) {
                    $self.bind(settings.event, function (event) {
                        if (!self.loaded) {
                            $self.trigger("appear");
                        }
                    });
                }
            });

            /* Check if something appears when window is resized. */
            $window.bind("resize", function (event) {
                update();
            });

            /* Force initial check if images should appear. */
            $(document).ready(function () {
                update();
            });

            return this;
        };

        /* Convenience methods in jQuery namespace.           */
        /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

        $.belowthefold = function (element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = $window.height() + $window.scrollTop();
            } else {
                fold = $(settings.container).offset().top + $(settings.container).height();
            }

            return fold <= $(element).offset().top - settings.threshold;
        };

        $.rightoffold = function (element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = $window.width() + $window.scrollLeft();
            } else {
                fold = $(settings.container).offset().left + $(settings.container).width();
            }

            return fold <= $(element).offset().left - settings.threshold;
        };

        $.abovethetop = function (element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = $window.scrollTop();
            } else {
                fold = $(settings.container).offset().top;
            }

            return fold >= $(element).offset().top + settings.threshold + $(element).height();
        };

        $.leftofbegin = function (element, settings) {
            var fold;

            if (settings.container === undefined || settings.container === window) {
                fold = $window.scrollLeft();
            } else {
                fold = $(settings.container).offset().left;
            }

            return fold >= $(element).offset().left + settings.threshold + $(element).width();
        };

        $.inviewport = function (element, settings) {
            return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                   !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
        };

        /* Custom selectors for your convenience.   */
        /* Use as $("img:below-the-fold").something() or */
        /* $("img").filter(":below-the-fold").something() which is faster */

        $.extend($.expr[':'], {
            "below-the-fold": function (a) { return $.belowthefold(a, { threshold: 0 }); },
            "above-the-top": function (a) { return !$.belowthefold(a, { threshold: 0 }); },
            "right-of-screen": function (a) { return $.rightoffold(a, { threshold: 0 }); },
            "left-of-screen": function (a) { return !$.rightoffold(a, { threshold: 0 }); },
            "in-viewport": function (a) { return $.inviewport(a, { threshold: 0 }); },
            /* Maintain BC for couple of versions. */
            "above-the-fold": function (a) { return !$.belowthefold(a, { threshold: 0 }); },
            "right-of-fold": function (a) { return $.rightoffold(a, { threshold: 0 }); },
            "left-of-fold": function (a) { return !$.rightoffold(a, { threshold: 0 }); }
        });
    })(jQuery, window);
    /*-------------/ lazy loading --------------*/

    /**********Start Facebook logoin implementation*********/
    if ($("a.FacebookMergePanel").length > 0) {
        $("a.FacebookMergePanel").click(function (e) {
            e.preventDefault();
            $(".FBMergeoverlayPanel").fadeIn("slow");
            return false;
        });
    }
    if ($("a.fb_merge_close").length > 0) {
        $("a.fb_merge_close").click(function () {
            $(".FBMergeoverlayPanel").fadeOut("slow");
        });
    }

    if (window.addEventListener)
        window.addEventListener("load", initFacebook, false);
    else if (window.attachEvent)
        window.attachEvent("onload", initFacebook);
    else window.onload = initFacebook;
    /**********END Facebook logoin implementation*********/

    $(".lazyimage").lazyload({ effect: "fadeIn" });
    $(".lazy").lazyload({ effect: "fadeIn" });

    if ($("#Location_CountryID").length > 0) {
        /**********Start******Update by debashis tewary*****************/
        if ($("#hdnfornewpublocation").length > 0) {
            var URL = "http://" + DomainName + "/Location/GetNewaddedStatesByCountryId";
        }
        else {
            var URL = "http://" + DomainName + "/Location/GetStatesByCountryId";
        }
        /**********End******Update by debashis tewary*****************/
        if (url.split('/').length == 5) {
            if ($("#Location_CountryID").length == 1)
                $("#Location_StateID").val("0");
        }

        countryChange($("#Location_CountryID"), $("#Location_StateID"), URL);
    }
    if ($("#Location_StateID").length > 0) {
        /**********Start******Update by debashis tewary*****************/
        if ($("#hdnfornewpublocation").length > 0) {
            var URL = "http://" + DomainName + "/Location/GetNewaddedCitiesByStateId";
            newlocationstateChange($("#Location_CountryID"), $("#Location_StateID"), $("#Location_CityID"), URL)
        }
        else {
            var URL = "http://" + DomainName + "/Location/GetCitiesByStateId";
            if (url.split('/').length == 5) {
                if ($("#Location_CityID").length == 1)
                    $("#Location_CityID").empty().append($("<option value=\"0\">City</option>"));
            }
            stateChange($("#Location_StateID"), $("#Location_CityID"), URL);
        }
        /*// var URL = "http://" + DomainName + "/Location/GetCitiesByStateId";*/
        /* //stateChange($("#Location_StateID"), $("#Location_CityID"), URL);*/
        /**********End******Update by debashis tewary*****************/
        /* //var URL = "http://" + DomainName + "/Location/GetCitiesByStateId";*/
        /* //stateChange($("#Location_StateID"), $("#Location_CityID"), URL);*/
    }
    if ($("#Location_CityID").length > 0) {
        /**********Start******Update by debashis tewary*****************/
        if ($("#hdnfornewpublocation").length > 0) {
            var URL = "http://" + DomainName + "/Location/GetNewaddedTitlesByCityId";
            newlocationcityChange($("#Location_CountryID"), $("#Location_StateID"), $("#Location_CityID"), $("#Location_PublicationTitleID"), URL);
        }
        else {
            /*Commented and added by Kanchan on 2013-09-20 for malfunctioning in pubtitle dropdown population with respect to city*/
            /*var URL = "http://" + DomainName + "/Location/GetTitlesByCityId";*/
            var URL = "http://" + DomainName + "/Location/GetTitlesByCityIdAndStateId";
            /*cityChange($("#Location_CityID"), $("#Location_PublicationTitleID"), URL);*/
            if (url.split('/').length == 5) {
                if ($("#Location_PublicationTitleID").length == 1)
                    $("#Location_PublicationTitleID").empty().append($("<option value=\"0\">Publication</option>"));
            }
            cityChange($("#Location_CityID"), $("#Location_StateID"), $("#Location_PublicationTitleID"), URL);
            /*End commented and added by Kanchan on 2013-09-20 for malfunctioning in pubtitle dropdown population with respect to city*/
        }
        /**********End******Update by debashis tewary*****************/
        /*//var URL = "http://" + DomainName + "/Location/GetTitlesByCityId";*/
        /*//cityChange($("#Location_CityID"), $("#Location_PublicationTitleID"), URL);*/
    }
    if ($("#Dates_BetweenStartYear").length > 0) {
        var URL = "http://" + DomainName + "/Date/GetEndYears";
        startYearChange($("#Dates_BetweenStartYear"), $("#Dates_BetweenEndYear"), URL);
    }
    if ($("#Dates_BetweenDatesYear").length > 0) {
        var URL = "http://" + DomainName + "/Date/GetEndYears";
        startYearChange($("#Dates_BetweenDatesYear"), $("#Dates_EndYear"), URL);
    }
    if ($("#BirthLocation_CountryID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetStatesByCountryId";
        countryChange($("#BirthLocation_CountryID"), $("#BirthLocation_StateID"), URL);
    }
    if ($("#FuneraltLocation_CountryID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetStatesByCountryId";
        countryChange($("#FuneraltLocation_CountryID"), $("#FuneraltLocation_StateID"), URL);
    }
    if ($("#MarriageLocation_CountryID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetStatesByCountryId";
        countryChange($("#MarriageLocation_CountryID"), $("#MarriageLocation_StateID"), URL);
    }
    if ($("#BirthLocation_StateID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetCitiesByStateId";
        stateChange($("#BirthLocation_StateID"), $("#BirthLocation_CityID"), URL);
    }
    if ($("#FuneraltLocation_StateID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetCitiesByStateId";
        stateChange($("#FuneraltLocation_StateID"), $("#FuneraltLocation_CityID"), URL);
    }
    if ($("#MarriageLocation_StateID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetCitiesByStateId";
        stateChange($("#MarriageLocation_StateID"), $("#MarriageLocation_CityID"), URL);
    }
    if ($("#birthYear").length > 0) {
        var URL = "http://" + DomainName + "/Date/GetEndYears";
        startYearChange($("#birthYear"), $("#funeralDeathYear"), URL);
    }
    if ($("div.serchDatePadd").length > 0) {
        $('#Dates_StartYear').change(function () {
            $('#rbExactDates').attr('checked', 'checked'); $('#Dates_IsExactDate').val("true"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false");
            if ($('#Dates_StartYear').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked');
                $('#Dates_BetweenStartYear').val(""); $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
                $('#Dates_BetweenDatesYear').val(""); $('#Dates_BetweenDatesMonth').val(""); $('#Dates_BetweenDatesDay').val("");
                $('#Dates_EndYear').empty().append("<option>Year</option>"); $('#Dates_EndMonth').val(""); $('#Dates_EndDay').val("");
            }
            else { $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false"); }
        });
        $('#Dates_StartMonth').change(function () {
            $('#rbExactDates').attr('checked', 'checked');
            if ($('#Dates_StartMonth').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("true"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false");
                $('#Dates_BetweenStartYear').val(""); $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
                $('#Dates_BetweenDatesYear').val(""); $('#Dates_BetweenDatesMonth').val(""); $('#Dates_BetweenDatesDay').val("");
                $('#Dates_EndYear').empty().append("<option>Year</option>"); $('#Dates_EndMonth').val(""); $('#Dates_EndDay').val("");
            }
            else { $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false"); }
        });
        $('#Dates_StartDay').change(function () {
            $('#rbExactDates').attr('checked', 'checked');
            if ($('#Dates_StartDay').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("true"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false");
                $('#Dates_BetweenStartYear').val(""); $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
                $('#Dates_BetweenDatesYear').val(""); $('#Dates_BetweenDatesMonth').val(""); $('#Dates_BetweenDatesDay').val("");
                $('#Dates_EndYear').empty().append("<option>Year</option>"); $('#Dates_EndMonth').val(""); $('#Dates_EndDay').val("");
            }
            else { $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false"); }
        });
        $('#Dates_BetweenStartYear').change(function () {
            $('#rbBetweenYears').attr('checked', 'checked');
            if ($('#Dates_BetweenStartYear').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("true");
                $('#Dates_IsBetweenDates').val("false"); $('#Dates_StartYear').val(""); $('#Dates_StartMonth').val(""); $('#Dates_StartDay').val("");
                $('#Dates_BetweenDatesYear').val(""); $('#Dates_BetweenDatesMonth').val(""); $('#Dates_BetweenDatesDay').val("");
                $('#Dates_EndYear').empty().append("<option>Year</option>");
                $('#Dates_EndMonth').val(""); $('#Dates_EndDay').val("");
            }
            else {

                $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false");
            }
        });
        $('#Dates_BetweenEndYear').change(function () {
            $('#rbBetweenYears').attr('checked', 'checked');
            if ($('#Dates_BetweenEndYear').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("true"); $('#Dates_IsBetweenDates').val("false");
                $('#Dates_StartYear').val(""); $('#Dates_StartMonth').val(""); $('#Dates_StartDay').val("");
                $('#Dates_BetweenDatesYear').val(""); $('#Dates_BetweenDatesMonth').val(""); $('#Dates_BetweenDatesDay').val("");
                $('#Dates_EndYear').empty().append("<option>Year</option>"); $('#Dates_EndMonth').val(""); $('#Dates_EndDay').val("");
            }

            else {
                $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false");
            }
        });

        $('#Dates_BetweenDatesYear').change(function () {
            $('#rbBetweenDates').attr('checked', 'checked');
            if ($('#Dates_BetweenDatesYear').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("true");
                $('#Dates_StartYear').val(""); $('#Dates_StartMonth').val(""); $('#Dates_StartDay').val("");
                $('#Dates_BetweenStartYear').val("");
                $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
            }
            else {
                $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false");
            }
        });
        $('#Dates_BetweenDatesMonth').change(function () {
            $('#rbBetweenDates').attr('checked', 'checked');
            if ($('#Dates_BetweenDatesMonth').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val = "false"; $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("true");
                $('#Dates_StartYear').val(""); $('#Dates_StartMonth').val(""); $('#Dates_StartDay').val("");
                $('#Dates_BetweenStartYear').val(""); $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
            }
            else { $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false"); }
        });
        $('#Dates_BetweenDatesDay').change(function () {
            $('#rbBetweenDates').attr('checked', 'checked');
            if ($('#Dates_BetweenDatesDay').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("true");
                $('#Dates_StartYear').val(""); $('#Dates_StartMonth').val(""); $('#Dates_StartDay').val("");
                $('#Dates_BetweenStartYear').val(""); $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
            }
            else { $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false"); }
        });
        $('#Dates_EndYear').change(function () {
            $('#rbBetweenDates').attr('checked', 'checked');
            if ($('#Dates_EndYear').val() != "") {

                $("#hdnDateEndYear").val($('#Dates_EndYear').val());
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("true");
                $('#Dates_StartYear').val(""); $('#Dates_StartMonth').val(""); $('#Dates_StartDay').val("");
                $('#Dates_BetweenStartYear').val(""); $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
            }
            else { $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false"); }
        });
        $('#Dates_EndMonth').change(function () {
            $('#rbBetweenDates').attr('checked', 'checked');
            if ($('#Dates_EndMonth').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("true");
                $('#Dates_StartYear').val(""); $('#Dates_StartMonth').val(""); $('#Dates_StartDay').val("");
                $('#Dates_BetweenStartYear').val(""); $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
            }
            else { $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false"); }
        });
        $('#Dates_EndDay').change(function () {
            $('#rbBetweenDates').attr('checked', 'checked');
            if ($('#Dates_EndDay').val() != "") {
                $('#Dates_IsPublicationDate').attr('checked', 'checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("true");
                $('#Dates_StartYear').val(""); $('#Dates_StartMonth').val(""); $('#Dates_StartDay').val("");
                $('#Dates_BetweenStartYear').val(""); $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
            }
            else { $('#Dates_IsPublicationDate').removeAttr('checked'); $('#Dates_IsExactDate').val("false"); $('#Dates_IsBetweenYears').val("false"); $('#Dates_IsBetweenDates').val("false"); }
        });
    }

    if ($("#btnTutorialFAQSearch").length > 0) { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'FAQSearch', 'TutorialFAQSearch']); topSearchSection('btnTutorialFAQSearch', 'txtTutorialFAQSearch', 'Enter Search term here and press Search'); }
    if ($("#btnTopSearch").length > 0) { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'TopSearch', 'TopSearchKeyword']); topSearchSection('btnTopSearch', 'txtTopSearchKeyword', 'Enter a Keyword'); }
    if ($("#btnNewBrowseSearch").length > 0) { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'BrowsePapers', 'Search']); topSearchSection('btnNewBrowseSearch', 'txtNewBrowseKeyword', 'Enter Keywords or Names to Search for'); }

    if ($("#btnHomeSearch").length > 0) {
        _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'HomeSearch', 'HomeKeyword']); topSearchSection('btnHomeSearch', 'txtHomeKeyword', 'Enter Keywords to Get Started!');
    }
    if ($("#btnSearchPanel").length > 0) { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'SearchPanel', 'SearchPanel']); topSearchSection('btnSearchPanel', 'txtSearchPanel', 'e.g. The Beatles'); }
    if ($("#btnAdvanceSearch").length > 0) {
        _gaq.push(['_setSiteSpeedSampleRate', 8]);
        _gaq.push(['_trackEvent', 'AdvanceSearchButton', 'AdvanceSearchPanel']);
        if ($("#hdnclass_wrap").length > 0) { if ($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous" && $("#divResultsPerPage").length > 0) { { $("#divResultsPerPage").attr("style", "display:none;"); } } else { $("#divResultsPerPage").attr("style", "display:block;"); } }
        fcnValidateSearchTerms('btnAdvanceSearch');
    }
    if ($("#btnDiscover").length > 0) { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'DiscoverButton', 'DiscoverSearchPanel']); topSearchSection('btnDiscover', 'txtKeyword', 'E.g. Neil Armstrong Lands on Moon'); }

    if ($("#weeklylink2").length > 0) { $("#weeklylink2").click((function () { $("#image1").attr('src', '/Weeklyperspective/CaptchaSrc?v=' + new Date()); })); }

    if ($.trim(document.URL).toLowerCase() == "http://" + DomainName + "/".toLowerCase()) { $("#home").addClass("active"); }
    else if ($.trim(document.URL).toLowerCase() == "http://" + DomainName + "/registration".toLowerCase()) { $("#signup").addClass("active"); }
    else if ($.trim(document.URL).toLowerCase() == "http://" + DomainName + "/selectplan".toLowerCase()) { $("#signup").addClass("active"); }
    else if ($.trim(document.URL).toLowerCase() == "http://" + DomainName + "/advancedsearch".toLowerCase()) { $("#advancedsearch").addClass("active"); }
    else if ($.trim(document.URL).toLowerCase() == "http://" + DomainName + "/advancesearch".toLowerCase()) { $("#advancedsearch").addClass("active"); }
    else if ($.trim(document.URL).toLowerCase() == "http://" + DomainName + "/store".toLowerCase()) { $("#store").addClass("active"); }
    else if ($.trim(document.URL).toLowerCase() == "http://" + DomainName + "/help".toLowerCase()) { $("#help").addClass("active"); }
    else if ($.trim(document.URL).toLowerCase() == "http://" + DomainName + "/htmlviewerfaq".toLowerCase()) { $("#help").addClass("active"); }

    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/repromovies") == 0) { if ($("#liMovies").length > 0) { $("#liMovies").addClass("active"); } if ($("#movies").length > 0) { $("#movies").addClass("active"); } $("#store").addClass("active"); }
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/repropeople") == 0) { if ($("#liPeople").length > 0) { $("#liPeople").addClass("active"); } if ($("#people").length > 0) { $("#people").addClass("active"); } $("#store").addClass("active"); }
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/reprosports") == 0) { if ($("#liSports").length > 0) { $("#liSports").addClass("active"); } if ($("#sports").length > 0) { $("#sports").addClass("active"); } $("#store").addClass("active"); }
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/repromoments") == 0) { if ($("#liMoments").length > 0) { $("#liMoments").addClass("active"); } if ($("#moments").length > 0) { $("#moments").addClass("active"); } }
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/store") == 0) { if ($("#liMoments").length > 0) { $("#liMoments").addClass("active"); } if ($("#moments").length > 0) { $("#moments").addClass("active"); } $("#store").addClass("active"); }
    /*//*********** Browse Pages Strated by Chandi@20120827 ********************************    */
    if ($("#hdnAbsoluteUrl").length > 0) { _browseUrl = $("#hdnAbsoluteUrl").val(); }

    if ($.trim(_browseUrl).toLowerCase().indexOf("http://" + DomainName + "/browse/browselocations") == 0) {
        if ($.trim(_browseUrl).toLowerCase().indexOf("http://" + DomainName + "/browse/browselocations?country=us") == 0) {
            if ($("#usaLocation").length > 0) { $("#usaLocation").addClass("active"); }
            if ($("#usaLocationChart").length > 0) { $("#usaLocationChart").addClass("active"); }
        }
        else {
            if ($("#otherLocation").length > 0) { $("#otherLocation").addClass("active"); }
            if ($("#otherLocationChart").length > 0) { $("#otherLocationChart").addClass("active"); }
            if ($("#usaLocation").length > 0) { $("#usaLocation").removeClass("active"); }
            if ($("#usaLocationChart").length > 0) { $("#usaLocationChart").removeClass("active"); }
        }
    }
    if ($.trim(_browseUrl).toLowerCase().indexOf("http://" + DomainName + "/browse/browsedate") == 0) {
        if ($("#brDate").length > 0) { $("#brDate").addClass("active"); }
        if ($("#brDateChart").length > 0) { $("#brDateChart").addClass("active"); }
        if ($("#usaLocation").length > 0) { $("#usaLocation").removeClass("active"); }
        if ($("#usaLocationChart").length > 0) { $("#usaLocationChart").removeClass("active"); }
    }
    if ($.trim(_browseUrl).toLowerCase().indexOf("http://" + DomainName + "/browse/browsearticles") == 0) {
        if ($("#brArticle").length > 0) { $("#brArticle").addClass("active"); }
        if ($("#brArticleChart").length > 0) { $("#brArticleChart").addClass("active"); }
        if ($("#usaLocation").length > 0) { $("#usaLocation").removeClass("active"); }
        if ($("#usaLocationChart").length > 0) { $("#usaLocationChart").removeClass("active"); }
    }

    if ($.trim(_browseUrl).toLowerCase().indexOf("http://" + DomainName + "/browse") == 0) {
        if ($.trim($('#Dates_IsBetweenDates').val()).toLowerCase() == "true") { $('#rbBetweenDates').attr('checked', 'checked'); };
        if ($.trim($('#Dates_IsExactDate').val()).toLowerCase() == "true") { $('#rbExactDates').attr('checked', 'checked'); };
        if ($.trim($('#Dates_IsBetweenYears').val()).toLowerCase() == "true") { $('#rbBetweenYears').attr('checked', 'checked'); };
    }
    $("button.redBtn").click(function () {
        if ($("#LastName").length > 0 && $("#FirstName").length > 0) {
            if ($.trim($("#FirstName").val()) != '' && $.trim($("#LastName").val()) == '') {
                alert("Please enter a valid lastname!");
                return false;
            }
        }
    });
    /* //*********** Browse Pages Endded by Chandi *********************************/

    /*//************** SelectPlan looks like lockdown for anonymous users by Chandi@20130128 **********/
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/selectplan") == 0) {
        if ($("#hdnclass_wrap").length > 0) {
            if ($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
                if ($(".main-navigation").length > 0) { $(".main-navigation").addClass("hidden") };
                if ($(".fb-login-container").length > 0) { $(".fb-login-container").addClass("hidden") };
                if ($("#idTopSearch").length > 0) { $("#idTopSearch").addClass("hidden") };
                if ($(".footerLinks").length > 0) { $(".footerLinks").addClass("hidden") };
                if ($("#idLogo").length > 0 && $("#divLogo").length > 0) {
                    var _logo = $("#idLogo").html();
                    $("#divLogo").html(_logo);
                }
            }
        }
    }
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/login") == 0) {
        if ($("#hdnclass_wrap").length > 0) {
            if ($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
                if ($(".main-navigation").length > 0) { $(".main-navigation").addClass("hidden") };
                if ($(".fb-login-container").length > 0) { $(".fb-login-container").addClass("hidden") };
                if ($("#idTopSearch").length > 0) { $("#idTopSearch").addClass("hidden") };
                if ($(".footerLinks").length > 0) { $(".footerLinks").addClass("hidden") };
                if ($("#idLogo").length > 0 && $("#divLogo").length > 0) {
                    var _logo = $("#idLogo").html();
                    $("#divLogo").html(_logo);
                }
            }
        }
    }

    /*//************** Endded SelectPlan looks like lockdown for anonymous users by Chandi@20130128 **********/
    /************************************My Account section start*********************/
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/myaccount/myaccountsettings") == 0) {
        $('select#ddlcountry').change(function () {
            var val = $(this).val();
            if (val == "US") {
                document.getElementById('trddlstate').style.display = '';
                document.getElementById('trtxtProvince').style.display = 'none';
            }
            else {
                document.getElementById('trddlstate').style.display = 'none';
                document.getElementById('trtxtProvince').style.display = '';
            }
        });
    }
    /************************************My Account section end*********************/
    /************************************Sujoy added on 07/09/2012 for Newly added content*********/
    if ($("#NewLocation_newaddcountryID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetNewaddedStatesByCountryId";
        NewcountryChange($("#NewLocation_newaddcountryID"), $("#NewLocation_newaddstateID"), URL);
    }
    if ($("#NewLocation_newaddstateID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetNewaddedCitiesByStateId";
        NewstateChange($("#NewLocation_newaddcountryID"), $("#NewLocation_newaddstateID"), $("#NewLocation_newaddcityID"), URL);
    }
    if ($("#NewLocation_newaddcityID").length > 0) {
        var URL = "http://" + DomainName + "/Location/GetNewaddedTitlesByCityId";
        NewcityChange($("#NewLocation_newaddcountryID"), $("#NewLocation_newaddstateID"), $("#NewLocation_newaddcityID"), $("#NewLocation_newaddpubID"), URL);
    }
    /************************************Sujoy end  Newly added content*********/
    /*===================================Debasis added for social net 201201015==============*/
    /*//if ($("#socialnetcontrol").length > 0) { setTimeout('setSocialButtons()', 5000); }*/
    if ($("#socialnetcontrol").length > 0) {
        if (window.addEventListener)
            window.addEventListener("load", setSocialButtons, false);
        else if (window.attachEvent)
            window.attachEvent("onload", setSocialButtons);
        else window.onload = setSocialButtons;
    }
    /*==================================End=======================*/
    /*---------------- public viewer scripts-------------------*/
    $(".autoselect").focus(function () { $(this).select(); });
    if ($("#hdnclass_wrap").length > 0) {
        if ($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
            $('.premium').click(function (event) {
                event.preventDefault();
                var _freepopup = "http://" + DomainName + "/commonpopup/FreeRegistrationWithPwd";
                if ($("#hdnallfreepop").length > 0) { _freepopup = "http://" + DomainName + "/" + $("#hdnallfreepop").val(); }
                if ($("#hdnPaymentMode").length > 0 && ($("#hdnPaymentMode").val() == "PaidVersion")) { top.window.location = _becomememberpage; }
                else { openPopup(_freepopup + "?r=" + Math.floor(Math.random() * 10001), 800, true); }
                return false;
            });
        }
    }
    /*----------------/ public viewer scripts-------------------*/
    if (window.addEventListener)
        window.addEventListener("load", imageloaderBanner, false);
    else if (window.attachEvent)
        window.attachEvent("onload", imageloaderBanner);
    else window.onload = imageloaderBanner;

    $("a.popupclose").click(function (event) {
        event.preventDefault();
        if ($("#divBuyPopup").length > 0) { setCookie("NewspaperARCHIVE.com.shoppingCart", 1, 1); $(this).parent("div.buyPopupBox").fadeOut(); return false; }
        else { $(this).parent("div.buyPopupBox").fadeOut(); return false; }
    });

    /******************** START Home page lockdown after 1 view allow section *****************/
    if ($("#hdn_IsHomePage").length > 0 && $.trim($("#hdn_IsHomePage").val()).toLowerCase() == "true") {
        if ($("#hdnclass_wrap").length > 0 && $.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
            var _ViewCount = 0;

            var LockdownVal = readCookieValue("NewspaperARCHIVE.com.User.GetLockdown");
            if (LockdownVal != null && LockdownVal.length > 0) { _ViewCount = readFromString(LockdownVal, "ViewCount"); }

            if ($(".footerLinks").length > 0) { $(".footerLinks a").each(function () { setCookieUnEscaped("NewspaperARCHIVE.com.User.GetLockdown", "ViewCount=" + (parseInt(_ViewCount) + 1), 12); }); }
            if ($(".main-navigation").length > 0) { $(".main-navigation a").each(function () { setCookieUnEscaped("NewspaperARCHIVE.com.User.GetLockdown", "ViewCount=" + (parseInt(_ViewCount) + 1), 12); }); }
            if ($(".advSearchLink").length > 0) { $(".advSearchLink").each(function () { setCookieUnEscaped("NewspaperARCHIVE.com.User.GetLockdown", "ViewCount=" + (parseInt(_ViewCount) + 1), 12); }); }
            if ($("#div_homePage").length > 0) { $("#div_homePage a").each(function () { setCookieUnEscaped("NewspaperARCHIVE.com.User.GetLockdown", "ViewCount=" + (parseInt(_ViewCount) + 1), 12); }); }

            LockdownVal = readCookieValue("NewspaperARCHIVE.com.User.GetLockdown");
            if (LockdownVal != null && LockdownVal.length > 0) {
                var _ViewCount = readFromString(LockdownVal, "ViewCount");
                if (parseInt(_ViewCount) > 1) {
                    var _paidpop = "http://" + document.domain.toString() + "/common/SERPPopupv1";
                    if ($("#hdn_HomePaidPop").length > 0) { _paidpop = "http://" + document.domain.toString() + "/" + $("#hdn_HomePaidPop").val(); }

                    var _freepopup = "http://" + document.domain.toString() + "/common/SERPPopupv1";
                    if ($("#hdn_HomeFreePop").length > 0) { _freepopup = "http://" + document.domain.toString() + "/" + $("#hdn_HomeFreePop").val(); }

                    var PaymentVal = readCookieValue("NewspaperARCHIVE.com.User.PaymentAttempt");
                    if (PaymentVal != null && PaymentVal.length > 0) {
                        var _PaymentCount = readFromString(PaymentVal, "PaymentCount");
                        if (parseInt(_PaymentCount) > 1) {
                            if ($(".footerLinks").length > 0) { $(".footerLinks a").each(function () { $(this).attr("href", "javascript:openPopup('" + _paidpop + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                            if ($(".main-navigation").length > 0) { $(".main-navigation a").each(function () { $(this).attr("href", "javascript:openPopup('" + _paidpop + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }

                            if ($(".advSearchLink").length > 0) { $(".advSearchLink").each(function () { $(this).attr("href", "javascript:openPopup('" + _paidpop + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                            if ($("#div_homePage").length > 0) { $("#div_homePage a").each(function () { $(this).attr("href", "javascript:openPopup('" + _paidpop + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                            if ($("#Map").length > 0) { $("#Map").click(function () { openPopup(_paidpop + "?r=" + Math.floor(Math.random() * 10001), 1000, false, true); return false; }); }
                            if ($(".availableMapThumbs").length > 0) { $(".availableMapThumbs a").each(function () { $(this).attr("href", "javascript:openPopup('" + _paidpop + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                        }
                        else {
                            if ($(".footerLinks").length > 0) { $(".footerLinks a").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                            if ($(".main-navigation").length > 0) { $(".main-navigation a").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }

                            if ($(".advSearchLink").length > 0) { $(".advSearchLink").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                            if ($("#div_homePage").length > 0) { $("#div_homePage a").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                            if ($("#Map").length > 0) { $("#Map").click(function () { openPopup(_paidpop + "?r=" + Math.floor(Math.random() * 10001), 1000, false, true); return false; }); }
                            if ($(".availableMapThumbs").length > 0) { $(".availableMapThumbs a").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                        }
                    }
                    else {
                        if ($(".footerLinks").length > 0) { $(".footerLinks a").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                        if ($(".main-navigation").length > 0) { $(".main-navigation a").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }

                        if ($(".advSearchLink").length > 0) { $(".advSearchLink").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                        if ($("#Map").length > 0) { $("#Map").click(function () { openPopup(_paidpop + "?r=" + Math.floor(Math.random() * 10001), 1000, false, true); return false; }); }
                        if ($(".availableMapThumbs").length > 0) { $(".availableMapThumbs a").each(function () { $(this).attr("href", "javascript:openPopup('" + _freepopup + "?r=" + Math.floor(Math.random() * 10001) + "', 1000, false, true);"); }); }
                    }
                }
            }
        }
    }
    /******************** END Home page lockdown after 1 view allow section *****************/
    /******************** START Old Browser Popup *****************/
    if ($("#IsOldBrowser").length > 0 && $.trim($("#IsOldBrowser").val()).toLowerCase() == "true") {
        openOldBrowserPopup("http://" + DomainName + "/commonpopup/OldBrowserPopup?r=" + Math.floor(Math.random() * 10001), 800);
    }
    /******************** END Old Browser Popup *****************/
    if ($("#hdn_HomePageName").length > 0 && $.trim($("#hdn_HomePageName").val()).toLowerCase() == "homev1") { createCookie("Preferencesv1", "ABTestHomePage=homev1", "1"); }
    else if ($("#hdn_HomePageName").length > 0 && $.trim($("#hdn_HomePageName").val()).toLowerCase() == "homev2") { createCookie("Preferencesv1", "ABTestHomePage=homev2", "1"); }
    else if ($("#hdn_HomePageName").length > 0 && $.trim($("#hdn_HomePageName").val()).toLowerCase() == "homev3") { createCookie("Preferencesv1", "ABTestHomePage=homev3", "1"); }
    else if ($("#hdn_HomePageName").length > 0 && $.trim($("#hdn_HomePageName").val()).toLowerCase() == "homev4") { createCookie("Preferencesv1", "ABTestHomePage=homev4", "1"); }
    else if ($("#hdn_HomePageName").length > 0 && $.trim($("#hdn_HomePageName").val()).toLowerCase() == "homev5") { createCookie("Preferencesv1", "ABTestHomePage=homev5", "1"); }
    else if ($("#hdn_HomePageName").length > 0 && $.trim($("#hdn_HomePageName").val()).toLowerCase() == "homev6") { createCookie("Preferencesv1", "ABTestHomePage=homev6", "1"); }
    else if ($("#hdn_HomePageName").length > 0 && $.trim($("#hdn_HomePageName").val()).toLowerCase() == "homev7") { createCookie("Preferencesv1", "ABTestHomePage=homev7", "1"); }
    else if ($("#hdn_HomePageName").length > 0 && $.trim($("#hdn_HomePageName").val()).toLowerCase() == "home") { createCookie("Preferencesv1", "ABTestHomePage=home", "1"); }

    if ($("#discoverpeople").length > 0) { fcnValidateDiscoverSearchBox("discoverpeople"); }
    if ($("#discoverpeoplehomev5").length > 0) { fcnValidateDiscoverHomeV5SearchBox("discoverpeoplehomev5"); }
    if ($("#discoverpeoplehomev6").length > 0) { fcnValidateDiscoverHomeV6SearchBox("discoverpeoplehomev6"); }

    if ($(".showMoreSearchOpt a").length > 0) {
        $('.showMoreSearchOpt a').click(function () {
            if ($('.moreSearchOptArea').is(':visible')) { $('.moreSearchOptArea').slideUp(400); $(this).html('Show More'); }
            else { $('.moreSearchOptArea').slideDown(400); $(this).html('Show Less'); }
        })
    }

    /******************** START secondary credit card Popup *****************/
    if ($("#IsShowCCPopup").length > 0 && $.trim($("#IsShowCCPopup").val()).toLowerCase() == "true") {
        var ua = "0";
        if ($("#hdnuaid").length > 0) { ua = $.trim($("#hdnuaid").val()); }
        openSecondaryCrditCardPopup("http://" + DomainName + "/commonpopup/SecondaryCreditCardPopup?ua=" + ua + "&r=" + Math.floor(Math.random() * 10001), 800);
    }
    /******************** END secondary credit card Popup *****************/

    if ($("#hdnlimitstart").length > 0 && $.trim($("#hdnlimitstart").val()).toLowerCase() == "start") {
        if ($("#hdnclass_wrap").length > 0 && $.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
            if ($("#hdnuip").length > 0) {
                var _islockdownpage = "0";
                if ($("#hdnisallowpage").length > 0) { _islockdownpage = $("#hdnisallowpage").val(); }
                if (_islockdownpage == "0") {
                    var cval = readCookieValue("NewspaperARCHIVE.com.User.PageViews");
                    if (cval != null && cval.length > 0) {
                        var _ip = readFromString(cval, "IP");
                        var _cValCount = readFromString(cval, "PageViewCount");
                        if (_ip == $("#hdnuip").val()) {
                            if (_cValCount.length > 0) {
                                var _viewlimit = "100"; if ($("#hdnviewlimit").length > 0) { _viewlimit = $("#hdnviewlimit").val(); }
                                if (parseInt(_cValCount) > parseInt(_viewlimit)) { parent.location.href = "http://" + DomainName + "/lockdown"; }
                                else { setCookieUnEscaped("NewspaperARCHIVE.com.User.PageViews", "IP=" + $("#hdnuip").val() + "&PageViewCount=" + (parseInt(_cValCount) + 1), 1); }
                            }
                            else { setCookieUnEscaped("NewspaperARCHIVE.com.User.PageViews", "IP=" + $("#hdnuip").val() + "&PageViewCount=1", 1); }
                        }
                        else { setCookieUnEscaped("NewspaperARCHIVE.com.User.PageViews", "IP=" + $("#hdnuip").val() + "&PageViewCount=1", 1); }
                    }
                    else { setCookieUnEscaped("NewspaperARCHIVE.com.User.PageViews", "IP=" + $("#hdnuip").val() + "&PageViewCount=1", 1); }
                }
            }
        }
    }

    /******************** START Newspaperarchive.com - Version 2 Ticket #342 .PSD files (Closable Popover for Free Membership) *****************/
    if ($("#hdnclass_wrap").length > 0 && $.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
        if ($("#IsShowFreeMemberPopup").length > 0 && $.trim($("#IsShowFreeMemberPopup").val()).toLowerCase() == "true") {
            if ($("#hdn_IsHomePage").length > 0 && $.trim($("#hdn_IsHomePage").val()).toLowerCase() == "closablepopup") { /*setTimeout(openclosablepopup, 30000);*/ }
        }
    }
    /******************** END Newspaperarchive.com - Version 2 Ticket #342 .PSD files (Closable Popover for Free Membership) *****************/

    if ($(".paginationBtnActive").length > 0) {
        $(".paginationBtnActive").removeAttr("data-ajax-update");
        $(".paginationBtnActive").removeAttr("data-ajax-mode");
        $(".paginationBtnActive").removeAttr("data-ajax-method");
        $(".paginationBtnActive").removeAttr("data-ajax");
        $(".paginationBtnActive").attr("href", "javascript:void(0);");
    }

    /*--------------------------- Google analytics Event tracking added by sujoy on 13th Feb 2013 start --------------------------------*/
    if ($("#genealogy").length > 0) { $("#genealogy").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'GenealogyMadeSimple', 'GenealogyMadeSimpleSearchBox']); }); }
    if ($("#BirthAnnouncements").length > 0) { $("#BirthAnnouncements").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'BirthAnnouncements', 'BirthAnnouncementsSearchBox']); }); }
    if ($("#FuneralAnnouncements").length > 0) { $("#FuneralAnnouncements").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'Obituaries', 'ObituariesSearchBox']); }); }
    if ($("#MarriageAnnouncements").length > 0) { $("#MarriageAnnouncements").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'MarriageAnnouncements', 'MarriageAnnouncementsSearchBox']); }); }
    /*==================Button Event Tracking in GA added by debasis20130222 ========================*/
    if ($("#btnbrowse").length > 0) { $("#btnbrowse").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'Browse', 'Browse']); }); }
    if ($("#btnclear").length > 0) { $("#btnclear").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'Browse', 'Clear']); }); }
    if ($("#btnBrowseSearch").length > 0) { $("#btnBrowseSearch").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'BrowseNarrow', 'Search']); }); }
    if ($("#btnBrowseclear").length > 0) { $("#btnBrowseclear").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'BrowsNarrow', 'BrowseClear']); }); }
    if ($("#btnWeeklyComment").length > 0) { $("#btnWeeklyComment").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'WeeklyperspectiveBlogs', 'Comment']); }); }
    if ($("#btnSendContactInfo").length > 0) { $("#btnSendContactInfo").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'ContactUs', 'SendContactInfo']); }); }
    if ($("#btnCMSpagefamily").length > 0) { $("#btnCMSpagefamily").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'CMS Page', 'Discover Your Family History']); }); }
    if ($("#btnsuggestion").length > 0) { $("#btnsuggestion").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'Suggestions', 'Send Suggestions']); }); }
    if ($("#btnviewpapers").length > 0) { $("#btnviewpapers").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'YourBirthday', 'View Birthdsay Papers']); }); }
    if ($("#btnFirstNameSearch").length > 0) { $("#btnFirstNameSearch").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'YourClassmates or YourFriends or YourName', 'first_last name Search']); }); }
    if ($("#btncommunitybrowse").length > 0) { $("#btncommunitybrowse").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'YourCommunity', 'Browse']); }); }
    if ($("#btncommunityclear").length > 0) { $("#btncommunityclear").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'YourCommunity', 'Clear']); }); }
    if ($("#btnBeginMembership").length > 0) { $("#btnBeginMembership").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'SEO Viewer', 'Become-Member']); }); }
    if ($("#getEmbedCode").length > 0) { $("#getEmbedCode").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'SEO Viewer', 'GetEmbedCode']); }); }
    if ($("#CloseEmbbed").length > 0) { $("#CloseEmbbed").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'SEO Viewer', 'CloseEmbbed']); }); }
    if ($("#Login").length > 0) { $("#Login").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'Login', 'Login']); }); }
    if ($("#ForgotPassword").length > 0) { $("#ForgotPassword").click(function () { _gaq.push(['_setSiteSpeedSampleRate', 8]); _gaq.push(['_trackEvent', 'Login', 'ForgotPassword']); }); }
    /*==================END ========================*/
    /*--------------------------- Google analytics Event tracking added by sujoy on 13th Feb 2013 End --------------------------------*/

    if ($('.millionPapersContentArea').length > 0) {
        $('.millionPapersContentArea').find('.expandBtn').each(function () {
            $(this).click(function () {
                var btnText = $(this).text();
                if (btnText == 'Expand') {
                    $(this).text('Close');
                    $(this).removeClass('btn-warning expandBtn');
                    $(this).addClass('btn-danger closeBtn');
                    $(this).parent().parent().parent().addClass('dblBrd');
                    $(this).parent().parent().parent().next('.millionExpandBlock').slideDown();
                } else {
                    $(this).text('Expand');
                    $(this).removeClass('btn-danger closeBtn');
                    $(this).addClass('btn-warning expandBtn');
                    $(this).parent().parent().parent().removeClass('dblBrd');
                    $(this).parent().parent().parent().next('.millionExpandBlock').slideUp();
                }
            });
        });
    }

    /*-------------------------Exit Grabber-----------------------------*/
    $("#hdn_ClosePopupPageTrack").val("0");

    $('body').mousemove(function (e) {
        if (e.pageY < ($(window).scrollTop() + 20)) {
            if (($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") && ($.trim($("#hdn_ExitGrabberFlag").val()) == "0") && ($.trim($("#hdn_ClosePopupPageTrack").val()) == "0")) {
                //if (($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous")) {
                var ExitGrabber = getCookie("NewspaperARCHIVE.com.ExitGrabber");
                if (ExitGrabber != "1") {

                    if ($("div.thickBoxArea").length > 0) {
                        if ($("div.thickBoxArea").css('display') == 'none') {
                            ExitGrabberPopupCreater("http://" + DomainName + "/commonpopup/ExitGrabber", 950, true);
                        }
                    }
                    else {
                        ExitGrabberPopupCreater("http://" + DomainName + "/commonpopup/ExitGrabber", 950, true);
                    }
                }
            }
        }
    });
    /*------------------------------------------------------*/

    /*START Added for library module removed after login on 2013 nov 14*/
    if ($("#hdnclass_wrap").length > 0) {
        if ($.trim($("#hdnclass_wrap").val()).toLowerCase() != "anonymous") {
            $("#h2library").css("display", "none");
            $("#libraryimage").css("display", "none");
        }
    }
    /*END Added for library module removed after login on 2013 nov 14*/
    if ($("#btnBrowseGo").length > 0) {
        $("#btnBrowseGo").click(function () {
            var selectedValue = $("#Location_CountryID").val();
            if (selectedValue == "") {
                alert("Please select a country");
                return false;
            }
            else { return true; }
        });
    }
})

function ExitGrabberPopupCreater(page, custWidth, noClose) {
    $("#hdn_ExitGrabberFlag").val("1");
    if (custWidth == undefined) { popWidth = false; } else { popWidth = custWidth; }
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea').height($('body').height()).append(bodyBox);
    var newCustomStyle = 0;
    $('link').each(function () {
        var cssLink = $(this).attr('href');
        if (cssLink.toLowerCase().indexOf("new-custom-style") >= 0) {
            newCustomStyle = 1;
        }
    });
    //if (newCustomStyle == 0) {
    //    $('head').append('<link href="http://' + DomainName + '/Content/new-custom-style.css" rel="stylesheet" type="text/css"/>');
    //}
    $.ajax({
        url: page,
        success: function (data) {
            if (noClose == undefined || noClose == true) {
                if ($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
                    bodyBox.html('<div id="divExitGrabber" class="btnClose"></div>' + data);
                    _popEnable = 1;
                }
            } else {
                if ($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
                    bodyBox.html(data);
                }
            }

            $('body').prepend(popupContainer);
            popupContainer.fadeTo(0, 0);
            popupResize()
            popupContainer.fadeTo(600, 1);
            $('#divExitGrabber').click(function () {
                $("#hdn_ExitGrabberFlag").val("0");
                $("#hdn_ClosePopupPageTrack").val("1");
                popupContainer.fadeTo(600, 0, function () {
                    popupContainer.remove();
                    setCookie("NewspaperARCHIVE.com.ExitGrabber", 1, 1);
                });
            });

            $(document).keypress(function (e) {
                if (e.keyCode == 27) {
                    $("#hdn_ExitGrabberFlag").val("0");
                    $("#hdn_ClosePopupPageTrack").val("1");
                    popupContainer.fadeTo(600, 0, function () {
                        popupContainer.remove();
                        setCookie("NewspaperARCHIVE.com.ExitGrabber", 1, 1);
                    });
                }
            });
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}

/*============Exit Grabber code================*/
$("#FirstName").live("keyup", function () {
    if ($.trim($('#FirstName').val()).length > 0)
        $("#sp_firstname").text("");
    else
        $("#sp_firstname").text("First name required.");
});

$("#Lastname").live("keyup", function () {
    if ($.trim($('#Lastname').val()).length > 0)
        $("#sp_lastname").text("");
    else
        $("#sp_lastname").text("Last name required.");
});

$("#EmailAddress").live("keyup", function () {
    if ($.trim($('#EmailAddress').val()).length > 0)
        $("#sp_emailaddress").text("");
    else
        $("#sp_emailaddress").text("E-mail address required.");
});

$("#Password").live("keyup", function () {
    if ($.trim($('#Password').val()).length > 0)
        $("#sp_password").text("");
    else
        $("#sp_password").text("Password required.");
});

function ExitGrabberValidation() {
    var _return = true;
    var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    var firstName = $.trim($('#FirstName').val());
    var lastName = $.trim($('#Lastname').val());
    var emailaddress = $.trim($('#EmailAddress').val());
    var password = $.trim($('#Password').val());
    var planid = $.trim($('#Planid').val());
    var paymentUrl = $.trim($('#PaymentUrl').val());

    if (firstName.length == 0) {
        $("#sp_firstname").text("First name required.");
        $('#FirstName').focus();
        _return = false;
    }
    if (lastName.length == 0) {
        $("#sp_lastname").text("Last name required.");
        $('#Lastname').focus()
        _return = false;
    }
    if (emailaddress == null || emailaddress == "") {
        $("#sp_emailaddress").text("E-mail address required.");
        $("#EmailAddress").focus();
        _return = false;
    } else if (regex.test(emailaddress) == false) {
        $("#sp_emailaddress").text("Invalid E-mail address.");
        $("EmailAddress").focus();
        _return = false;
    }
    if (password.length == 0) {
        $("#sp_password").text("Password required.");
        $("#Password").focus();
        _return = false;
    } else if (Password.length < 6) {
        $("#sp_password").text("Password should be at least 6 characters in length.");
        $("#Password").focus();
        _return = false;
    }
    //return _return;
    if (_return) {
        $.ajax({
            url: "http://" + DomainName + "/Common/CheckEmailAddress",
            data: {
                EmailAddress: emailaddress
            },
            dataType: 'json',
            traditional: true,
            type: 'POST',
            success: function (data) {
                if (data.Message == "success") {
                    $("#hdn_ExitGrabberFlag").val("0");
                    setCookie("NewspaperARCHIVE.com.ExitGrabber", 1, 1);
                    var user = data.message;
                    var form = document.createElement("form");
                    form.setAttribute("method", "post");
                    form.setAttribute("action", paymentUrl);
                    var hdnfirstname = document.createElement("input"); hdnfirstname.setAttribute("type", "hidden"); hdnfirstname.setAttribute("name", "firstname"); hdnfirstname.setAttribute("value", firstName);
                    var hdnlastname = document.createElement("input"); hdnlastname.setAttribute("type", "hidden"); hdnlastname.setAttribute("name", "lastname"); hdnlastname.setAttribute("value", lastName);
                    var hdnemail = document.createElement("input"); hdnemail.setAttribute("type", "hidden"); hdnemail.setAttribute("name", "emailaddress"); hdnemail.setAttribute("value", emailaddress);
                    var hdnplan = document.createElement("input"); hdnplan.setAttribute("type", "hidden"); hdnplan.setAttribute("name", "planid"); hdnplan.setAttribute("value", planid);
                    var hdnpass = document.createElement("input"); hdnpass.setAttribute("type", "hidden"); hdnpass.setAttribute("name", "password"); hdnpass.setAttribute("value", password);

                    form.appendChild(hdnfirstname);
                    form.appendChild(hdnlastname);
                    form.appendChild(hdnemail);
                    form.appendChild(hdnplan);
                    form.appendChild(hdnpass);

                    document.body.appendChild(form);
                    form.submit();


                } else if (data.Message == "duplicate") {
                    $('#div_error').html("<div class=\"alert-panel\"><div class=\"alert alert-error\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">×</button>The email address you have provided has been already used.</div></div>");
                } else {
                    alert("Failed, please try again later.");
                }
            },
            error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); }
        });
    }
    return false;
}
/*============Exit Grabber code================*/

/*function openclosablepopup() { openfreememberclosablePopup("http://" + DomainName + "/common/closablepopoverfreemember?t=" + Math.floor(Math.random() * 10001), 1000); }*/
function openclosablepopup() { openfreememberclosablePopup("http://" + DomainName + "/commonpopup/NewSelectPlanPopOver?t=" + Math.floor(Math.random() * 10001), 1000); }
function freememberpopupbtnClick() {
    if (!$('#terms').is(':checked')) { window.alert('You must read and accept the Terms and Conditions to continue.'); return false; }
    else {
        BeginMembership('FirstName', 'Lastname', 'EmailAddress');
        var _len = 1; if ($("#hdnClosableLimit").length > 0) { _len = $("#hdnClosableLimit").val(); }
        var _time = 24; if ($("#hdnClosableExpired").length > 0) { _time = $("#hdnClosableExpired").val(); }
        setCookieUnEscapedExpiredHour("NewspaperARCHIVE.com.PreferencesPopup", "ShowClosablePop=" + _len, _time);
    }
}

function openOldBrowserPopup(page, custWidth, noClose) {
    if (custWidth == undefined) { popWidth = false; } else { popWidth = custWidth; }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea').height($('body').height()).append(bodyBox);
    $.ajax({
        url: page,
        success: function (data) {
            if (noClose == undefined || noClose == true) {
                bodyBox.html('<div id="divOldBrowse" class="btnClose"></div>' + data);
            } else { bodyBox.html(data); }

            $('body').prepend(popupContainer);
            popupContainer.fadeTo(0, 0);
            popupResize()
            popupContainer.fadeTo(600, 1);
            $('#divOldBrowse').click(function () {
                popupContainer.fadeTo(600, 0, function () {
                    popupContainer.remove();
                    createCookie("Preferencesv2", "OldBrowserPop=1", "1");
                });
            })
            if (noClose == undefined || noClose == true) {
                $(document).keypress(function (e) {
                    if (e.keyCode == 27) {
                        popupContainer.fadeTo(600, 0, function () {
                            popupContainer.remove();
                            createCookie("Preferencesv2", "OldBrowserPop=1", "1");
                        });
                    };
                });
            }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}

function openSecondaryCrditCardPopup(page, custWidth, noClose) {
    if (custWidth == undefined) { popWidth = false; } else { popWidth = custWidth; }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea').height($('body').height()).append(bodyBox);
    $.ajax({
        url: page,
        success: function (data) {
            if (noClose == undefined || noClose == true) {
                bodyBox.html('<div id="divSecondaryCCPop" class="btnClose"></div>' + data);
            } else { bodyBox.html(data); }

            $('body').prepend(popupContainer);
            popupContainer.fadeTo(0, 0);
            popupResize()
            popupContainer.fadeTo(600, 1);
            $('#divSecondaryCCPop').click(function () {
                popupContainer.fadeTo(600, 0, function () {
                    popupContainer.remove();
                    createCookie("Preferences", "ShowSecondaryCCPop=1", "30");
                });
            })
            if (noClose == undefined || noClose == true) {
                $(document).keypress(function (e) {
                    if (e.keyCode == 27) {
                        popupContainer.fadeTo(600, 0, function () {
                            popupContainer.remove();
                            createCookie("Preferences", "ShowSecondaryCCPop=1", "30");
                        });
                    };
                });
            }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}

function openfreememberclosablePopup(page, custWidth, noClose, whiteBg, html, fixedScroll) {
    if (custWidth == undefined || custWidth == false) {
        popWidth = false;
    } else {
        popWidth = custWidth;
    }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea').height($('body').height()).append(bodyBox);

    if (fixedScroll != undefined && fixedScroll == true) { $(popupContainer).css({ 'position': 'fixed' }); }
    if (whiteBg != undefined && whiteBg == true) { $(popupContainer).addClass('thickBoxAreaWhite'); }

    function onSuccess(data) {
        var host = "http://" + window.location.hostname;
        if (noClose == undefined || noClose == true) {
            bodyBox.html('<div class="btnClose"></div>' + data);
        } else { bodyBox.html(data); }
        $('body').prepend(popupContainer);
        popupContainer.fadeTo(0, 0);

        popupResize();

        if ($(".pdfPanelIframe").length > 0) { $(".pdfPanelIframe").css({ 'display': 'none', 'height': 0, 'width': 0 }); }
        if (typeof popupOnload == 'function') { popupOnload(); }
        popupContainer.fadeTo(600, 1);
        if ($('.vsc').is(':visible')) { adjustVerticalScroll(); }
        function closepopup() {
            popupContainer.fadeTo(600, 0, function () {
                popupContainer.remove();
                var val = readCookieValue("NewspaperARCHIVE.com.PreferencesPopup");
                if ($("#hdnClosableExpired").length > 0) { _time = $("#hdnClosableExpired").val(); }
                if (val != null && val.length > 0) {
                    var _Count = readFromString(val, "ShowClosablePop");
                    if (_Count.length > 0) { setCookieUnEscapedExpiredHour("NewspaperARCHIVE.com.PreferencesPopup", "ShowClosablePop=" + (parseInt(_Count) + 1), _time); }
                }
                else { setCookieUnEscapedExpiredHour("NewspaperARCHIVE.com.PreferencesPopup", "ShowClosablePop=1", _time); }
            });
            if ($(".pdfPanelIframe").length > 0) { $('.pdfPanelIframe').show(); pdfViewerIframeAdjust(); }
        }

        $('.btnClose').click(function () { closepopup(); })

        if (noClose == undefined || noClose == true) {
            $(document).keypress(function (e) {
                if (e.keyCode == 27) {
                    popupContainer.fadeTo(600, 0, function () {
                        popupContainer.remove();
                        var val = readCookieValue("NewspaperARCHIVE.com.PreferencesPopup");
                        if ($("#hdnClosableExpired").length > 0) { _time = $("#hdnClosableExpired").val(); }
                        if (val != null && val.length > 0) {
                            var _Count = readFromString(val, "ShowClosablePop");
                            if (_Count.length > 0) { setCookieUnEscapedExpiredHour("NewspaperARCHIVE.com.PreferencesPopup", "ShowClosablePop=" + (parseInt(_Count) + 1), _time); }
                        }
                        else { setCookieUnEscapedExpiredHour("NewspaperARCHIVE.com.PreferencesPopup", "ShowClosablePop=1", _time); }
                    });
                };
            });
        }
    }
    if (html == undefined || html == false) {
        $.ajax({
            url: page,
            success: function (data) { onSuccess(data); }
        });
    } else { onSuccess(page); }
}

function openExplorerTreasureBoxPopup(page, custWidth, noClose) {
    if (custWidth == undefined) { popWidth = false; } else { popWidth = custWidth; }
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    var screenWidth = $(window).width();
    var screenHeight = $(window).height();
    var bodyBox = $(document.createElement('div')).addClass('bodyBox')
    var popupContainer = $(document.createElement('div')).addClass('thickBoxArea').height($('body').height()).append(bodyBox);
    $.ajax({
        url: page,
        success: function (data) {
            if (noClose == undefined || noClose == true) {
                bodyBox.html('<div id="divExplorerTreasureBox" class="btnClose"></div>' + data);
            } else { bodyBox.html(data); }

            $('body').prepend(popupContainer);
            popupContainer.fadeTo(0, 0);
            popupResize()
            popupContainer.fadeTo(600, 1);
            $('#divExplorerTreasureBox').click(function () {
                popupContainer.fadeTo(600, 0, function () {
                    popupContainer.remove();
                    createCookie("PreferencesExplorer", "ExplorerTreasurePop=1", "1");
                });
            })
            if (noClose == undefined || noClose == true) {
                $(document).keypress(function (e) {
                    if (e.keyCode == 27) {
                        popupContainer.fadeTo(600, 0, function () {
                            popupContainer.remove();
                            createCookie("PreferencesExplorer", "ExplorerTreasurePop=1", "1");
                        });
                    };
                });
            }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}

function imageloaderBanner() {
    if ($('#mainLogo').length > 0) {
        $('#mainLogo').attr('src', 'http://' + CDNUrl + '/content/images/logo.png');
    }
    if ($('div.publicViewerTopPanel').length > 0) {
        $('div.publicViewerTopPanel').attr('style', 'background:url(http://' + CDNUrl + '/content/images/viewer/public-viewer-top-pic.png) 0 100% no-repeat;');
    }
    if ($('div.publicViewerTopPanelNew').length > 0) {
        $('div.publicViewerTopPanel').attr('style', 'background:url(http://' + CDNUrl + '/content/images/new-plan-banner-bg.png) 0 100% no-repeat;');
    }
    if ($("#divoldStyle").length > 0) { $("#divoldStyle").addClass("outerWrapper"); }
    if ($("#divnewspaperDateRangeContainer").length > 0) { $("#divnewspaperDateRangeContainer").addClass("newspaperDateRangeContainer"); }
    if ($("#divfamilyContainerInner").length > 0) { $("#divfamilyContainerInner").addClass("familyContainerInner"); }
    if ($("#divfamilyFormContainer").length > 0) { $("#divfamilyFormContainer").addClass("familyFormContainer"); }

    if ($("#img_oldtopsearch").length > 0) { $("#img_oldtopsearch").attr('src', 'http://' + CDNUrl + '/Content/images/new-images/top-search-pic1.png'); }
    /*if ($("#img_newhomev5search").length > 0) { $("#img_newhomev5search").attr('src', 'http://' + CDNUrl + '/content/images/new-images/new-home-search-pic1.png'); }*/

    if ($("#imghmslogan").length > 0) { $("#imghmslogan").attr('src', 'http://' + CDNUrl + '/content/images/slogan.png'); }
    /*//if (document.URL == "http://" + DomainName + "/") { if ($("#frmbdy").length > 0) { $("#frmbdy").addClass("custom-background-home"); } }*/
    /*//if (document.URL == "http://" + DomainName + "/?ref=fbc") { if ($("#frmbdy").length > 0) { $("#frmbdy").addClass("custom-background-home"); } }*/
    if ($("#imghmtp1").length > 0) { $("#imghmtp1").attr('src', 'http://' + CDNUrl + '/content/images/tape.png'); }
    if ($("#imghmtp2").length > 0) { $("#imghmtp2").attr('src', 'http://' + CDNUrl + '/content/images/tape.png'); }
    if ($("#imghmtp3").length > 0) { $("#imghmtp3").attr('src', 'http://' + CDNUrl + '/content/images/tape.png'); }
    if ($("#imghmtp4").length > 0) { $("#imghmtp4").attr('src', 'http://' + CDNUrl + '/content/images/tape.png'); }

    if ($('#Icon1').length > 0) {
        $('#Icon1').addClass('librarySprite libIcon1');
        $('#Icon2').addClass('librarySprite libIcon2');
        $('#Icon3').addClass('librarySprite libIcon3');
        $('#Icon4').addClass('librarySprite libIcon4');
        $('#Icon5').addClass('librarySprite libIcon5');
        $('#Icon6').addClass('librarySprite libIcon6');
        $('#Icon7').addClass('librarySprite libIcon7');
        $('#Icon8').addClass('librarySprite libIcon8');
        $('#Icon9').addClass('librarySprite libIcon9');
        $('#Icon10').addClass('librarySprite libIcon10');
        $('#Icon11').addClass('librarySprite libIcon11');
    }
}

function GetStateCityPublication(CountryId, StateId, CityId) {
    var url = DomainName + "/Location/GetStatesCitiesPublications"
    $.ajax({
        cache: false,
        type: "GET",
        url: url,
        data: { "countryId": CountryId, "stateId": StateId, "cityId": CityId },
        success: function (data) {
            alert(data);

            //$.each(data, function (id, option) {
            //    //Modified by: Amit Kumar Srivastava
            //    //Modified date:22 Aug,2013
            //    //purpose: When selecting 0 index showing no record found
            //    if (option.id != 0) {
            //        ddlStates.append($('<option></option>').val(option.id).html(option.name));
            //    }
            //});
            //statesProgress.hide();
            //if ($("#HdnLocationStateId").val() != "") {
            //    ddlStates.val($("#HdnLocationStateId").val());
            //    $("#Location_StateID").change();
            //}

        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
        //error: function (xhr, ajaxOptions, thrownError) { statesProgress.hide(); }
    });


}

function countryChange(ctrlCountry, ctrlState, url) {
    $(ctrlCountry).change(function () {
        var selectedItem = $(ctrlCountry).val();
        var ddlStates = $(ctrlState);
        $("#HdnLocationStateId").val("");
        $("#HdnLocationCityId").val("");

        $("#HdnLocationPublicationId").val("");
        if ($("#Location_CountryID").length > 0) {
            if ($('#Location_CountryID').val() != "") {

                $('#HdnLocationCountryId').val($('#Location_CountryID').val());
                $('#Location_IsPublicationLocation').attr('checked', 'checked');
            } else { $('#Location_IsPublicationLocation').removeAttr('checked'); }
        }
        ddlStates.html('');
        ddlStates.append($("<option value=\"0\">State</option>"));
        if ($("#Location_CityID").length > 0) {
            $("#Location_CityID").html('');
            $("#Location_CityID").append($("<option value=\"0\">City</option>"));
        }

        if ($("#BirthLocation_CityID").length > 0) { $("#BirthLocation_CityID").html(''); $("#BirthLocation_CityID").append($("<option value=\"0\">City</option>")); }
        if ($("#FuneraltLocation_CityID").length > 0) { $("#FuneraltLocation_CityID").html(''); $("#FuneraltLocation_CityID").append($("<option value=\"0\">City</option>")); }
        if ($("#MarriageLocation_CityID").length > 0) { $("#MarriageLocation_CityID").html(''); $("#MarriageLocation_CityID").append($("<option value=\"0\">City</option>")); }

        if ($("#Location_PublicationTitleID").length > 0) {
            $("#Location_PublicationTitleID").html('');
            $("#Location_PublicationTitleID").append($("<option value=\"0\">Publication</option>"));
        }

        if (selectedItem != "") {
            //By Rakesh for showing loader on selection of drop down  on Nov 06,2013 
            var countryStatesProgress = $("#country-loading-progress");
            countryStatesProgress.show();
            $.ajax({
                cache: false,
                type: "GET",
                url: url,
                data: { "countryId": selectedItem, "addEmptyStateIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlStates.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                    countryStatesProgress.hide();
                    if ($("#HdnLocationStateId").val() != "") {
                        ddlStates.val($("#HdnLocationStateId").val());
                        $("#Location_StateID").change();
                    }

                },
                error: function (ex) {
                    ExceptionHandling(ex);
                }
                //error: function (xhr, ajaxOptions, thrownError) { statesProgress.hide(); }
            });
        }
    });
    if ($("#hdnAbsoluteUrl") != null) {
        if ($("#hdnAbsoluteUrl").length > 0) {
            _browseUrl = $("#hdnAbsoluteUrl").val();
        }
    }
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/tags") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/people") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/people") != 0 && $.trim(_browseUrl).toLowerCase().indexOf("http://" + DomainName + "/browse") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/browsenewpublications") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/serplockdown") != 0) {


        if ($("#Location_CountryID").length > 0) {
            //conditoin added for undefined and null By Rakesh/DK  on 25 NOv 2013 w r t task #310 on TFS
            if ($("#HdnLocationStateId").val() != "" && $("#HdnLocationStateId").val() != "undefined" && $("#HdnLocationStateId").val() != null) {

                var url = "http://" + DomainName + "/Location/GetStatesCitiesPublications"
                $.ajax({
                    cache: false,
                    type: "GET",
                    url: url,
                    data: { "countryId": $('#Location_CountryID').val(), "stateId": $("#HdnLocationStateId").val(), "cityId": $("#HdnLocationCityId").val() },
                    success: function (data) {

                        ddlStates = $("#Location_StateID");
                        ddlStates.html('');
                        ddlStates.append($("<option value=\"0\">State</option>"));
                        $.each(data[0], function (id, option) {
                            //Modified by: Amit Kumar Srivastava
                            //Modified date:22 Aug,2013
                            //purpose: When selecting 0 index showing no record found
                            if (option.id != 0) {
                                ddlStates.append($('<option></option>').val(option.id).html(option.name));
                            }
                        });

                        if ($("#HdnLocationStateId").val() != "") {
                            ddlStates.val($("#HdnLocationStateId").val());

                        }
                        ddlCities = $("#Location_CityID");
                        ddlCities.html('');
                        ddlCities.append($("<option value=\"0\">City</option>"));
                        $.each(data[1], function (id, option) {
                            //Modified by: Amit Kumar Srivastava
                            //Modified date:22 Aug,2013
                            //purpose: When selecting 0 index showing no record found
                            if (option.id != 0) {
                                ddlCities.append($('<option></option>').val(option.id).html(option.name));
                            }
                        });


                        if ($("#HdnLocationCityId").val() != "") {
                            ddlCities.val($("#HdnLocationCityId").val());

                        }
                        ddlTitles = $("#Location_PublicationTitleID");
                        ddlTitles.html('');
                        ddlTitles.append($("<option value=\"0\">Publication</option>"));
                        $.each(data[2], function (id, option) {
                            //Modified by: Amit Kumar Srivastava
                            //Modified date:22 Aug,2013
                            //purpose: When selecting 0 index showing no record found
                            if (option.id != 0) {
                                ddlTitles.append($('<option></option>').val(option.id).html(option.name));
                            }
                        });


                        if ($("#HdnLocationPublicationId").val() != "") {

                            ddlTitles.val($("#HdnLocationPublicationId").val());
                        }
                        if ($('#HdnLocationCountryId').val() != "") {
                            $('#Location_CountryID').val($('#HdnLocationCountryId').val());
                        }
                        url = "http://" + DomainName + "/Location/GetStatesByCountryId";
                    },
                    error: function (ex) {
                        ExceptionHandling(ex);
                    }
                    //error: function (xhr, ajaxOptions, thrownError) { statesProgress.hide(); }
                });

                // GetStateCityPublication($('#Location_CountryID').val(), $("#HdnLocationStateId").val(), $("#HdnLocationCityId").val());
            }
            else if ($('#Location_CountryID').val() != "" && $("#HdnLocationStateId").val() == null) {
                $('#Location_CountryID').val($('#Location_CountryID').val());
                $('#Location_CountryID').change();
            }
            else {
                $('#Location_CountryID').val("");
            }
        }
    }



    if (document.URL == "http://" + DomainName + "/") {
        if ($("#BirthLocation_CountryID").length > 0) { $("#BirthLocation_CountryID").val(""); }
        if ($("#FuneraltLocation_CountryID").length > 0) { $("#FuneraltLocation_CountryID").val(""); }
        if ($("#MarriageLocation_CountryID").length > 0) { $("#MarriageLocation_CountryID").val(""); }
    }
}

function stateChange(ctrlState, ctrlCity, url) {
    $(ctrlState).change(function () {
        var selectedItem = $(ctrlState).val();
        var ddlCities = $(ctrlCity);

        if ($("#Location_StateID").length > 0) {
            if ($('#Location_StateID').val() != "") {
                $("#HdnLocationStateId").val($('#Location_StateID').val());

                $('#Location_IsPublicationLocation').attr('checked', 'checked');
            } else { $('#Location_IsPublicationLocation').removeAttr('checked'); }
        }
        ddlCities.html('');
        ddlCities.append($("<option value=\"0\">City</option>"));

        if ($("#Location_PublicationTitleID").length > 0) {
            $("#Location_PublicationTitleID").html('');
            $("#Location_PublicationTitleID").append($("<option value=\"0\">Publication</option>"));
        }

        if (selectedItem != "") {
            //Done by Rakesh to  show the loader on selection of the drop downs   on Nov 06, 2013
            var statesProgress = $("#states-loading-progress");
            statesProgress.show();
            $.ajax({
                cache: false,
                type: "GET",
                url: url,
                data: { "stateId": selectedItem, "addEmptyStateIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlCities.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                    statesProgress.hide();

                    if ($("#HdnLocationCityId").val() != "") {
                        ddlCities.val($("#HdnLocationCityId").val());
                        $("#Location_CityID").change();
                    }
                },
                error: function (ex) {
                    ExceptionHandling(ex);
                }
                // error: function (xhr, ajaxOptions, thrownError) { statesProgress.hide(); }
            });
        }
    });
}

/*Commented and added by Kanchan on 2013-09-20 for malfunctioning in pubtitle dropdown population with respect to city*/
/*function cityChange(ctrlCity, ctrlTitle, url) {*/
function cityChange(ctrlCity, ctrlState, ctrlTitle, url) {
    $(ctrlCity).change(function () {
        var selectedItem = $(ctrlCity).val();
        var ddlTitles = $(ctrlTitle);
        var selectedState = $(ctrlState).val(); /*Added by Kanchan on 2013-09-20 for malfunctioning in pubtitle dropdown population with respect to city*/

        if ($("#Location_CityID").length > 0) {
            if ($('#Location_CityID').val() != "") {

                $("#HdnLocationCityId").val($('#Location_CityID').val());

                $('#Location_IsPublicationLocation').attr('checked', 'checked');
            } else { $('#Location_IsPublicationLocation').removeAttr('checked'); }
        }
        ddlTitles.html('');
        ddlTitles.append($("<option value=\"0\">Publication</option>"));
        if (selectedItem != "") {
            //Done by Rakesh to  show the loader on selection of the drop downs   on Nov 06, 2013
            var CityProgress = $("#city-loading-progress");
            CityProgress.show();
            $.ajax({
                cache: false,
                type: "GET",
                url: url,
                data: { "cityId": selectedItem, "stateId": selectedState, "addEmptyStateIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlTitles.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                    CityProgress.hide();

                    if ($("#HdnLocationPublicationId").val() != "") {
                        ddlTitles.val($("#HdnLocationPublicationId").val());
                    }
                },
                error: function (ex) {
                    ExceptionHandling(ex);
                }
                // error: function (xhr, ajaxOptions, thrownError) { Progress.hide(); }
            });
        }
    });
}




function startYearChange(ctrlStartYear, ctrlEndYear, url) {
    $(ctrlStartYear).change(function () {
        var selectedItem = $(ctrlStartYear).val();
        var ddlEndYear = $(ctrlEndYear);
        ddlEndYear.html('');
        ddlEndYear.append($("<option value=\"\">Year</option>"));
        if (selectedItem != "") {
            var Progress = $("#loading-progress");
            Progress.show();
            $.ajax({
                cache: false,
                type: "GET",
                url: url,
                data: { "startYear": selectedItem, "addEmptyYearIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlEndYear.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                    if (document.URL == "http://" + DomainName + "/Browse") { }
                    else { }
                    Progress.hide();
                    //Modified by: Pradeep Tripathi
                    //Modified date:25 Feb,2014
                    //purpose: Remove fill the end year automatically Year(Task No #363) 
                    //if ($("#hdnDateEndYear").val() != "") {
                    //    ddlEndYear.val($("#hdnDateEndYear").val());

                    //}

                },
                error: function (ex) {
                    ExceptionHandling(ex);
                }
                //error: function (xhr, ajaxOptions, thrownError) { Progress.hide(); }
            });
        }
    });
    if (document.URL == "http://" + DomainName + "/") {
        if ($("#BirthDate_StartYear").length > 0) { $("#BirthDate_StartYear").val(""); }
        if ($("#birthYear").length > 0) { $("#birthYear").val(""); }
        if ($("#funeralDeathYear").length > 0) { $("#funeralDeathYear").val(""); }
        if ($("#MarriageDates_StartYear").length > 0) { $("#MarriageDates_StartYear").val(""); }
    }
    if ($("#hdnAbsoluteUrl").length > 0) { _browseUrl = $("#hdnAbsoluteUrl").val(); }


    //Changes done w.r. t. TFS Task-292 By Mamta Gupta/D
    if ($("#hdnSearchPanelStateId").val() != "0" && $("#hdnSearchPanelStateId").val() != "") {
        $("#Location_StateID").val($("#hdnSearchPanelStateId").val());
    }

    else {

        $("#Location_StateID").val("");
    }
    if ($("#hdnSearchPanelCountryId").val() != "0" && $("#hdnSearchPanelCountryId").val() != "") {
        $("#Location_CountryID").val($("#hdnSearchPanelCountryId").val());
    }
    else if ($.trim(document.URL).toLowerCase().indexOf("/us") <= 0) {
        $("#Location_CountryID").val("");
    }
    else {
        $("#Location_CountryID").val("7");

    }
    if ($("#hdnSearchPanelCityId").val() != "0" && $("#hdnSearchPanelCityId").val() != "") {
        $("#Location_CityID").val($("#hdnSearchPanelCityId").val());
    }

    else {
        $("#Location_CityID").val("");

    }
    if ($("#hdnSearchPanelPublicationTitleID").val() != "0" && $("#hdnSearchPanelPublicationTitleID").val() != "") {
        $("#Location_PublicationTitleID").val($("#hdnSearchPanelPublicationTitleID").val());
    }

    else {
        $("#Location_PublicationTitleID").val("");
    }



    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/tags") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/people") != 0 && $.trim(_browseUrl).toLowerCase().indexOf("http://" + DomainName + "/browsedate") != 0 && $.trim(_browseUrl).toLowerCase().indexOf("http://" + DomainName + "/browse") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/browsenewpublications") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/serplockdown") != 0) {
        if ($("#Dates_StartYear").length > 0) { $("#Dates_StartYear").val(""); }
        if ($("#Dates_BetweenStartYear").length > 0) { $("#Dates_BetweenStartYear").val(""); }


        if ($("#rbExactDates").attr("checked") != "checked") {
            $("#Dates_StartYear").val("");
            $("#Dates_StartMonth").val("");
            $("#Dates_StartDay").val("");
        }
        if ($("#rbBetweenYears").attr("checked") != "checked") {
            $("#Dates_BetweenStartYear").val("");
            $("#Dates_BetweenEndYear").val("");

        }
        if ($("#rbBetweenDates").attr("checuoioioioioked") != "checked") {
            $("#Dates_BetweenDatesYear").val("");
            $("#Dates_BetweenDatesMonth").val("");
            $("#Dates_BetweenDatesDay").val("");
            $("#Dates_EndYear").val("");
            $("#Dates_EndMonth").val("");
            $("#Dates_EndDay").val("");
        }

        if ($("#Dates_BetweenDatesYear").length > 0) {

            if ($("#Dates_BetweenDatesYear").val() != "") {
                $("#Dates_BetweenDatesYear").change();
            }
            else {
                //
                $("#Dates_BetweenDatesYear").val("");
                $('#Dates_BetweenEndYear').empty().append("<option>End Year</option>");
            }
        }
    }
}

function topSearchSection(ctrlButtonId, ctrlKeyword, keyterm) {
    document.getElementById(ctrlKeyword).value = keyterm;
    $('#' + ctrlKeyword + '').focus(function () { if (this.value == keyterm) { this.value = ''; } });
    $('#' + ctrlKeyword + '').blur(function () { if (this.value == '') { this.value = keyterm; } });

    $('#' + ctrlButtonId + '').click(function () {
        var val = DomainName;
        if ($("#cu").length > 0) { val = $("#cu").val().toLowerCase(); }
        /*//////_gaq.push(['_trackEvent', 'Testing' + ctrlButtonId, 'Testing' + ctrlKeyword, 'This is test', val]);*/

        var keyword = $("#" + ctrlKeyword + " ").val();
        if ($.trim(typeof keyword) == 'undefined' || $.trim(keyword) == "" || $.trim(keyword).toLowerCase() == $.trim(keyterm).toLowerCase() || $.trim(keyword).length < 2)
        { alert('Please enter a valid keyword.'); }
        else { return true; }
        return false;
    });
}

function fcnValidateSearchTerms(ctrlButtonId) {
    $('#' + ctrlButtonId + '').click(function () {
        var keyterm = "battle Gettysburg Civil War";
        var exactterms = "John Smith buried";
        var anyterms = "soldier infantry";
        var withoutterms = "Adams George Henry";

        var fname = $("#FirstName").val();
        var lname = $("#LastName").val();
        var allWords = $("#AllOfTheWordsString").val();
        var exactWords = $("#ExactPhraseString").val();
        var leastOneWord = $("#AnyOfTheWordsString").val();
        var without = $("#WithoutWordsString").val();

        if ($.trim(allWords).toLowerCase() == keyterm.toLowerCase()) { allWords = ""; }
        if ($.trim(exactWords).toLowerCase() == exactterms.toLowerCase()) { exactWords = ""; }
        if ($.trim(leastOneWord).toLowerCase() == anyterms.toLowerCase()) { leastOneWord = ""; }

        if ($.trim(fname).length > 0 && $.trim(lname).length == 0) {
            window.alert('Please enter a last name.');
            return false;
        }
        else if (($.trim(lname).length < 1) && $.trim(allWords) == "" && $.trim(exactWords) == "" && $.trim(leastOneWord) == "") {
            window.alert('Please enter search term(s). Search term(s) must be greater than 1 character.');
            return false;
        }
        else if ((($.trim(lname).length < 1) && ($.trim(allWords).length < 2) && ($.trim(exactWords).length < 2) && ($.trim(leastOneWord).length < 2))) {
            window.alert('Please enter search term(s).  Search term(s) must be greater than 1 character.');
            return false;
        }
        else if ($("#Dates_IsPublicationDate").val() == "true" && $("#Dates_IsExactDate").val() == "true") {
            /*////YYYY-mm-dd*/
            var _exactDay = $("#Dates_StartDay").val();
            if (_exactDay != "") {
                var dt;
                dt = GetObjectValue($("#Dates_StartYear").val(), 1905);
                dt += "-" + GetObjectValue($("#Dates_StartMonth").val(), 01);
                dt += "-" + GetObjectValue($("#Dates_StartDay").val(), 01);
                if (!isDate(dt)) { alert("Please enter valid date."); return false; }
            }
        }
        else if ($("#Dates_IsPublicationDate").val() == "true" && $("#Dates_IsBetweenDates").val() == "true") {
            var startDate;
            startDate = GetObjectValue($("#Dates_BetweenDatesMonth").val(), 01);
            startDate += "/" + GetObjectValue($("#Dates_BetweenDatesDay").val(), 01);
            startDate += "/" + GetObjectValue($("#Dates_BetweenDatesYear").val(), 1905);
            var d = new Date(startDate);

            var endDate;
            endDate = GetObjectValue($("#Dates_EndMonth").val(), 12);
            endDate += "/" + GetObjectValue($("#Dates_EndDay").val(), 31);
            endDate += "/" + GetObjectValue($("#Dates_EndYear").val(), 2012);
            var e = new Date(endDate);
            if (Date.parse(d) <= Date.parse(e)) { } else { alert("End date must be greater then beginning date."); return false; }

            /*////YYYY-mm-dd*/
            var _btstDay = $("#Dates_BetweenDatesDay").val();
            if (_btstDay != "") {
                var btdt;
                btdt = GetObjectValue($("#Dates_BetweenDatesYear").val(), 1905);
                btdt += "-" + GetObjectValue($("#Dates_BetweenDatesMonth").val(), 01);
                btdt += "-" + GetObjectValue($("#Dates_BetweenDatesDay").val(), 01);
                if (!isDate(btdt)) { alert("Please enter valid date."); return false; }
            }

            var _btendDay = $("#Dates_EndDay").val();
            if (_btendDay != "") {
                var _btendDt;
                _btendDt = $("#Dates_EndYear").val();
                _btendDt += "-" + $("#Dates_EndMonth").val();
                _btendDt += "-" + $("#Dates_EndDay").val();
                if (!isDate(_btendDt)) { alert("Please enter valid date."); return false; }
            }
        }
        else { return true; }
    });
}

function fcnValidateDiscoverSearchBox(ctrlButtonId) {


    $('#' + ctrlButtonId + '').click(function () {
        //_gaq.push(['_setSampleRate', '25']);
        _gaq.push(['_setSiteSpeedSampleRate', 8]);
        _gaq.push(["_trackEvent", "HomeDiscoverSearch", "DiscoverPeoplePlaces"]);
        var keyterm = "E.g. Moon Landing";
        var fnameterms = "E.g. John";
        var lnameterms = "E.g. Doe";




        var fname = $("#discoverFirstName").val();
        var lname = $("#discoverLastName").val();
        var allWords = $("#discoverKeyword").val();


        if ($.trim(allWords).toLowerCase() == keyterm.toLowerCase()) { allWords = ""; }
        if ($.trim(lname).toLowerCase() == lnameterms.toLowerCase()) { lname = ""; }
        if ($.trim(fname).toLowerCase() == fnameterms.toLowerCase()) { fname = ""; }

        if ((($.trim(fname).length > 0) && ($.trim($("#discoverFirstName").eq(0).val()) != $("#discoverFirstName").attr('placeholder'))) && (($.trim(lname).length == 0) || ($.trim($("#discoverLastName").eq(0).val()) == $("#discoverLastName").attr('placeholder')))) {
            window.alert('Please enter a last name.');
            return false;
        }
        else if ((($.trim(lname).length < 1) && ($.trim($("#discoverLastName").eq(0).val()) == $("#discoverLastName").attr('placeholder'))) && (($.trim(allWords) == "") && ($.trim($("#discoverKeyword").eq(0).val()) == $("#discoverKeyword").attr('placeholder')))) {
            window.alert('Please enter search term(s). Search term(s) must be greater than 1 character.');
            return false;
        }
        else if ((($.trim(lname).length < 1) || ($.trim($("#discoverLastName").eq(0).val()) == $("#discoverLastName").attr('placeholder'))) && ($.trim(allWords).length < 2)) {
            window.alert('Please enter search term(s).  Search term(s) must be greater than 1 character.');
            return false;
        }
        else if (($.trim($("#discoverFirstName").eq(0).val()) == $("#discoverFirstName").attr('placeholder')) && ($.trim($("#discoverLastName").eq(0).val()) == $("#discoverLastName").attr('placeholder')) && ($.trim($("#discoverKeyword").eq(0).val()) == $("#discoverKeyword").attr('placeholder'))) {
            window.alert('Please enter search term(s).  Search term(s) must be greater than 1 character.');
            return false;
        }
        else {

            return true;

        }
    });
}

function fcnValidateDiscoverHomeV5SearchBox(ctrlButtonId) {
    $('#' + ctrlButtonId + '').click(function () {
        //_gaq.push(['_setSampleRate', '25']);
        _gaq.push(['_setSiteSpeedSampleRate', 8]);
        _gaq.push(["_trackEvent", "HomeDiscoverSearch", "DiscoverPeoplePlaces"]);
        var fnameterms = "E.g. John";
        var lnameterms = "E.g. Doe";

        var fname = $("#discoverFirstName").val();
        var lname = $("#discoverLastName").val();

        if ($.trim(lname).toLowerCase() == lnameterms.toLowerCase()) { lname = ""; }
        if ($.trim(fname).toLowerCase() == fnameterms.toLowerCase()) { fname = ""; }

        if ($.trim(fname).length > 0 && $.trim(lname).length == 0) {
            window.alert('Please enter last name.');
            return false;
        }
        else if (($.trim(lname).length < 1) && $.trim(lname) == "") {
            window.alert('Please enter last name. Last name must be greater than 1 character.');
            return false;
        }
        else if ($.trim(lname).length < 1) {
            window.alert('Please enter last name. Last name must be greater than 1 character.');
            return false;
        }
        else { return true; }
    });
}

function fcnValidateDiscoverHomeV6SearchBox(ctrlButtonId) {
    $('#' + ctrlButtonId + '').click(function () {
        _gaq.push(["_trackEvent", "HomeDiscoverSearch", "DiscoverPeoplePlaces"]);
        var keywordterms = "What are you looking for?";

        var keyword = $("#discoverKeyword").val();

        if ($.trim(keyword).toLowerCase() == keywordterms.toLowerCase()) { keyword = ""; }

        if ($.trim(keyword).length == 0 || $.trim(keyword).length == 1) {
            window.alert('Please enter search term(s). Search term(s) must be greater than 1 character.');
            return false;
        }
        else { return true; }
    });
}

function GetObjectValue(obj, defaultReturnValue) { if (obj != "") { return obj; } else { return defaultReturnValue; } }

function SelectedResultsSaveSerp(ctrlbtn, imageIds, searchString) {
    var URL = "http://" + DomainName + "/Common/SelectedResultsSave";
    $.ajax({
        cache: false,
        type: "GET",
        url: URL,
        data: { "imageIds": imageIds, "searchString": searchString },
        success: function (data) {
            if (data == 1) {
                //Added By Vishant garg to remove the click event if search is already saved.
                $('#' + ctrlbtn + '').removeAttr('onclick');
                alert('The result has been added to your Treasure Box.');
                $('#' + ctrlbtn + '').text('Result Saved');
                $('#' + ctrlbtn + '').attr('class', 'button_green');
                $('#' + ctrlbtn + '').css('text-decoration', 'none');
                $('#' + ctrlbtn + '').css('color', '#ffffff');
            } else { alert('Failed to add result to your Treasure Box.'); }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
        //error: function (xhr, ajaxOptions, thrownError) {
        //    alert('Failed to save result to your Treasure Box.');
        //}
    });
}

/*--------------- JavaScript to open new window from flash tips -----------------------*/
function openNewWindow(URLtoOpen, windowName, windowFeatures) {
    newWindow = window.open(URLtoOpen, windowName, windowFeatures);
}
/*---------------/ JavaScript to open new window from flash tips -----------------------*/
function showmodal(id) {
    var pagerel = "";
    if ($('a.result-link').length > 0) {
        pagerel = $('a.result-link[id="' + id + '"]').attr("rel").toString();
        if (searchString != '' || searchString != "undefined") {
            if (returnSerp != '' || returnSerp != "undefined") {
                top.window.location.href = pagerel + "/pageno-" + id + "?tag=" + searchString + "&rtserp=" + returnSerp;
            } else { top.window.location.href = pagerel + "/pageno-" + id + "?tag=" + searchString; }
        }
        else { top.window.location.href = pagerel }
    }
}
/*--- jquery cookie implementation ------------*/
(function ($) {
    $.cookie = function (key, value, options) {
        /*// key and at least value given, set cookie...*/
        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
            options = $.extend({}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }
            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        /*// key and possibly options given, get cookie...*/
        options = value || {};
        var decode = options.raw ? function (s) { return s; } : decodeURIComponent;

        var pairs = document.cookie.split('; ');
        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('=') ; i++) {
            if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
        }
        return null;
    };
})(jQuery);
/*---/ jquery cookie implementation------------*/
/*------------- facebook implementation --------------*/
var checkAjaxAndCallBackReady_Ajax = checkAjaxAndCallBackReady_CallBack = false;
var checkDOMAndFBReady_FB = checkDOMAndFBReady_DOM = false;
ELoader = {
    _ready: {},
    _cbs: {},
    _k: 0,

    init: function () {
        var z = this;
        if (z._inited) return;
        z._inited = true;
        $(function () { z.setReady('dom'); });
    },

    setReady: function (item) {
        this._ready[item] = true;
        this.checkCBs();
    },

    isReady: function (items) {
        var ready = true,
            i, c;
        if (typeof (items) == 'string') items = items.split(' ');
        for (i = 0, c = items.length; i < c; ++i) {
            if (!this._ready[items[i]]) {
                ready = false;
                break;
            }
        }
        return ready;
    },

    checkCBs: function () {
        var k;
        for (k in this._cbs) {
            if (this.isReady(this._cbs[k].req)) {
                this._cbs[k].cb();
                delete this._cbs[k];
            }
        }
    },

    bind: function (item, cb) {
        var items = item.split(' ');
        if (this.isReady(items)) {
            cb();
        } else {
            this._cbs[this._k++] = {
                req: items,
                cb: cb
            };
        }
    }
};
ELoader.init();

FBActions = {
    _app_name: 'newspaper_archive',
    _cookie_name: 'fb-actions',
    _expires: 1000 * 60 * 60 * 24, /*//24 hours in ms*/

    getHistory: function () {
        var history = $.cookie(this._cookie_name);
        try {
            history = JSON.parse(history);
            history = this.cleanHistory(history);
        } catch (e) { }
        if (!history || typeof (history) != 'object') history = {};
        return history;
    },

    saveHistory: function (history) {
        $.cookie(this._cookie_name, JSON.stringify(history), {
            expires: this._expires / (1000 * 60 * 60 * 24)
        });
    },

    cleanHistory: function (history) {
        var cutoff = (new Date()).getTime() - this._expires,
            k, url;
        for (k in history) {
            for (url in history[k]) {
                if (history[k][url].timestamp && history[k][url].timestamp < cutoff) {
                    delete history[k][url];
                }
            }
        }
        return history;
    },

    fire: function (act, obj, url) {
        var z = this;
        act = act.replace('%app%', this._app_name);
        var f = function () {
            var key = act + '-' + obj,
                history = z.getHistory();

            if (!history[key] || !history[key][url]) {
                FB.getLoginStatus(function (r) {
                    if (r.authResponse) {
                        var send = {
                            access_token: r.authResponse.accessToken
                        };
                        send[obj] = url;
                        FB.api('/me/' + act, 'post', send, function (r) {
                            if (!r.error) {
                                history = z.getHistory();
                                if (!history[key]) history[key] = {};
                                history[key][url] = {
                                    timestamp: (new Date()).getTime()
                                };
                                z.saveHistory(history);
                            }
                        });
                    }
                });
            }
        };
        ELoader.bind('dom fb', f);
    }
};

/*//facebook share*/
function flashFBShare(type) {
    var sharelinkurl = $('meta[property="og:url"]').attr("content").toString();
    var sharepictureurl = $('meta[property="og:image"]').attr("content").toString();
    var sharename = $('meta[property="og:title"]').attr("content").toString();
    var sharecaption = 'NewspaperArchive.com';
    var sharedescription = ' ';
    var fbshare = {
        send: function (cb) {
            FB.ui({
                method: 'send',
                link: sharelinkurl,
                picture: sharepictureurl,
                name: sharename,
                caption: sharecaption,
                description: sharedescription
            }, cb);
        },
        feed: function (cb) {
            FB.ui({
                method: 'feed',
                link: sharelinkurl,
                picture: sharepictureurl,
                name: sharename,
                caption: sharecaption,
                description: sharedescription
            }, cb);
        }
    };

    if (FB.getAuthResponse()) {
        fbshare[type]();
    } else {
        var was_already_fb_user = FBUserLogin(function (r) {
            if (r.authResponse) {
                fbshare[type](function () {
                    if (!was_already_fb_user) window.location = window.location.href;
                });
            }
        });
    }
}

var fb_config = {
    scope: 'email,publish_actions'
};

function FBUserLogin(cb, opts) {
    opts = $.extend({
        scope: fb_config.scope
    }, opts || {});
    var was_already_fb_user = npaUserHasFBID();
    FB.login(function (response) {
        if (!was_already_fb_user) getUserDetails(response, true); /*//true means dont redirect, we'll do it later*/
        if (cb) cb(response);
    }, opts);
    return was_already_fb_user;
}

function npaUserHasFBID() {
    var was_already_fb_user = true;
    /* //if not logged in to NPA, show "Login with FB" button*/
    if ($("#hdnUserID").val() == 0) {
        was_already_fb_user = false;
    }
    else {
        /*//if logged in to NPA, but has never connected via FB, show "Connect with FB" button*/
        if ($("#hdnFBConnectedNeed").val() == 0) {
            was_already_fb_user = false;
        }

    }
    return was_already_fb_user;
}

function getUserDetails(response, notreloadpage) {
    if (response.authResponse) {
        FB.api('/me', function (response) {
            var user_location = '';
            if (typeof response.location != 'undefined') {
                try { user_location = response.location.name; }
                catch (err) { }
            }
            WebRegister(response.id, response.name, response.email, response.gender, user_location, response.first_name, '', response.last_name, response.username, notreloadpage);
        });
    } else { }
}

function WebRegister(id, name, email, gender, user_location, fname, mname, lname, username, notreloadpage) {
    var npauserid = $("#hdnUserID").val();
    var retURL = "";
    if ($("#cu").length > 0) { retURL = $("#cu").val().toLowerCase(); }
    else if (parent.$("#cu").length > 0) { retURL = parent.$("#cu").val().toLowerCase(); }
    var URL = "http://" + DomainName + "/Facebook/FacebookSaveUser?random=" + Math.floor(Math.random() * 10001);
    //var URL = "http://localhost:50444/Common/FacebookSaveUser?random=" + Math.floor(Math.random() * 10001);
    $.ajax({
        cache: false,
        type: "GET",
        url: URL,
        data: { "_userID": npauserid, "_AuthFacebookId": id, "_Email": email, "_FirstName": fname, "_MiddleName": mname, "_LastName": lname, "_Name": name, "_Username": username, "_Gender": gender, "_Location": user_location, "_returnURL": retURL },
        success: function (data) {
            var fbdata = data.split('|');
            if (fbdata[0].toLowerCase() == "success") {
                if (fbdata[2].toLowerCase() == "fbregister") {
                    var c = 0;
                    /*////if ($("#divregboxes").length > 0) { c = 1; $("#divregboxes").html("<p>We have sent you an email with an activation link. Please click on it to activate your account.</p>"); }*/
                    /*////if ($("#divregboxes1").length > 0) { c = 1; $("#divregboxes1").html("<div class=\"bodyBoxBottom sugnupPopupPanel\"><h2>We have sent you an email with an activation link. Please click on it to activate your account.</h2></div>"); }*/
                    /*////if (c == 0) { alert("We have sent you an email. Please activate your account from that email."); }*/
                    $.cookie("FBConnectUserID", fbdata[3]);
                    $.cookie("FBConnectProcess", 1);
                    $.cookie("FBConnectUserStatus", "Insert");
                }
                else {
                    $.cookie("FBConnectProcess", 2);
                    if (fbdata[2] == "fbconnect") { $.cookie("FBConnectUserID", fbdata[3]); }
                    else { $.cookie("FBConnectUserID", fbdata[2]); }
                }
                if (!notreloadpage) {
                    window.location.href = window.location.href;
                }
                checkAjaxAndCallBackReady_Ajax = true;
                checkAjaxAndCallBackReady();
            }

            //Added by 
            if (fbdata[0].toLowerCase() == "failedfacebook") {
                $(".btnClose").click(); openPopup("http://" + DomainName + "/HtmlFiles/FBConnectFailed.html?r=" + Math.floor(Math.random() * 10001));
            }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
        //error: function (error) {
        //}
    });
}

function checkAjaxAndCallBackReady() {
    if (checkAjaxAndCallBackReady_CallBack && checkAjaxAndCallBackReady_Ajax) {
        var url = top.window.location.href;
        if ($.trim(url).toLowerCase().indexOf("ref=fbc") == 0) { url = top.window.location.href + (top.window.location.href.indexOf('?') == -1 ? '?' : '&') + 'ref=fbc'; }
        top.window.location.href = url;
    }
}

function ConnectFB() {
    var was_already_fb_user = FBUserLogin(function (r) {
        if (r.authResponse) {
            if (!was_already_fb_user) {
                checkAjaxAndCallBackReady_CallBack = true;
                checkAjaxAndCallBackReady();
            }
        }
    });
}

function NPAlogOut() {
    if (FB.getAuthResponse()) { window.location.href = DomainName + '/logout'; }
    window.location.href = DomainName + '/logout';
}

function OpenFBLoginModal() {
    var objWidth = 498;
    var objHeight = 298;
    $("#FBLoginModal").fadeIn("slow");
}
function OpenFBConnectModal() {
    if ($('#FBConnectModal').html() != null) {
        var bodyBox = $('#FBConnectModal').children('.bodyBox');
        $('#FBConnectModal').width('100%').height($('body').height())
        var screenWidth = $(window).width();
        var screenHeight = $(window).height();
        var margin = '';
        var bbWidth = 0;
        if (screenHeight - 60 > bodyBox.height()) { margin = Math.floor(((screenHeight - 60) - bodyBox.height()) / 2) + 'px ' + ($('body').width() / 100 * 7) + 'px'; }
        else { margin = '0px ' + ($('body').width() / 100 * 7) + 'px'; }
        bodyBox.css({ 'margin': margin });
    }
    $("#FBConnectModal").fadeIn("slow");
}

function CloseFBModal() {
    $('.ui-dialog').css('display', 'none');
    $('.ui-widget-overlay').css('display', 'none');
    window.location.href = window.location.href;
}
function onShareBtnClicked(type, imgUrl) { flashFBShare('send'); }
function onPostWallBtnClicked(type, imgUrl) { flashFBShare('feed'); }

function DOMAndFBLoadComplete() {
    if ($('#divflashViewer').length > 0) { setTimeout("loadFlashViewerdiv()", "3000"); }
    if ($('#loadLockDownframe').length > 0) { SeLockDownFrameSrc(); }
    /*-------------Open Modal-----------------*/
    if ($('#hdnIsClearCookie').length > 0 && $("#hdnIsClearCookie").val() == 1) {
        $.cookie("FBConnectUserID", 0);
        $.cookie("FBConnectProcess", 0);
        $.cookie("FBConnectUserStatus", 0);
        if ($('#hdnOpenFBModal').length > 0 && $("#hdnOpenFBModal").val() == 0) {
            window.location.reload();
        }
    }
    if ($('#hdnOpenFBModal').length > 0 && $("#hdnOpenFBModal").val() == 1) { $(".btnClose").click(); openPopup("http://" + DomainName + "/HtmlFiles/FBLogin.html?r=" + Math.floor(Math.random() * 10001)); }
    if ($('#hdnOpenFBModal').length > 0 && $("#hdnOpenFBModal").val() == 2) { $(".btnClose").click(); openPopup("http://" + DomainName + "/HtmlFiles/FBConnect.html?r=" + Math.floor(Math.random() * 10001)); }
    /*-------------Open Modal-----------------*/
    if ($('#hdnFbMerge').val() == "1") { /*document.getElementById('ifm').src = DomainName + "/fbmerge.aspx?ru=" + $("#hdnFbMergeRu").val();*/ loadFBViewerStatus(); }
    setpiniterest();
}
function openFacebookMergePopup() { $(".btnClose").click(); openPopup("http://" + DomainName + "/HtmlFiles/FBMergePopup.html?r=" + Math.floor(Math.random() * 10001), 700); }
function Redirection(_lnk) { top.parent.location = "http://" + DomainName + "/" + _lnk + ""; }
function loadFBViewerStatus() {
    var fbviewednewspapersCount = 0;
    var fbviewremainingnewspapersCount = 0;
    var fbviewedids = 0;
    var totalviewed = 0;
    var maxpreview = 1;
    var CookieVal = readCookieValue("NewspaperARCHIVE.com.RecentPdfs");
    if (CookieVal != null && CookieVal.length > 0) {
        totalviewed = fbviewednewspapersCount = readFromString(CookieVal, "totalviewed");
        maxpreview = readFromString(CookieVal, "maxpreview");
    }

    if (totalviewed != 0) {
        if (maxpreview > totalviewed)
            fbviewremainingnewspapersCount = maxpreview - totalviewed;
    }
    else { fbviewednewspapersCount = 0; fbviewremainingnewspapersCount = 1; }

    if (fbviewremainingnewspapersCount == 0) { $('#ltlFBViewerStatus_Merge').html('You have viewed ' + fbviewednewspapersCount + ' newspaper(s) today. Please register in order to view more newspapers.'); }
    else {
        $('#ltlFBViewerStatus_Merge').html('You have viewed ' + fbviewednewspapersCount + ' newspapers today. you may view ' + fbviewremainingnewspapersCount + ' more as a Facebook user.');
        if (fbviewednewspapersCount == 1) {
            $('#ltlFBViewerStatus_Merge').html('You have viewed ' + fbviewednewspapersCount + ' newspaper today. you may view ' + fbviewremainingnewspapersCount + ' more as a Facebook user.');
        }
    }
    $("#divDockablePanel_FBStatus1").css('display', 'inline');
}

ELoader.bind('dom fb', function () {
    var fbconnect_button = "";
    var fbConnectSERP = "";
    if ($("#hdnUserID").val() == 0) {
        fbconnect_button = "<a href=\"javascript:void(0);\" class=\"facebookBtn\">Login with Facebook</a>";
        fbConnectSERP = "<a href=\"javascript:void(0);\" class=\"facebookBtn\">Login with Facebook</a>";
    }
    else {
        if ($('#hdnFBConnectedNeed').length > 0 && $("#hdnFBConnectedNeed").val() == 0) {
            fbconnect_button = "<a href=\"javascript:void(0);\" class=\"facebookBtn\">Connect with Facebook</a>";
            fbConnectSERP = "<a href=\"javascript:void(0);\" class=\"facebookBtn\">Connect with Facebook</a>";
        }
    }

    if ($('#divSERPfbconnect').length > 0) { $("#divSERPfbconnect").html(fbConnectSERP); }
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/login") != 0) {
        if ($("#hdnclass_wrap").length > 0) {
            $("#divfb-connect").html(fbconnect_button);
        }
    }
    $(function () {
        $('#divfb-connect a').bind('click', function (e) { e.preventDefault(); ConnectFB(); });
        if ($('#divSERPfbconnect').length > 0) { $('#divSERPfbconnect a').bind('click', function (e) { e.preventDefault(); ConnectFB(); }); }
    });
});

/*-------------/ facebook implementation --------------*/
/*----- home page chart snippets---*/
function deleteCookie(name) {
    var d = new Date();
    document.cookie = name + '=;expires=' + d.toGMTString() + ';' + ';';
}
function Get_Cookie(check_name) {
    var a_all_cookies = document.cookie.split(';');
    var a_temp_cookie = '';
    var cookie_name = '';
    var cookie_value = '';
    var b_cookie_found = false;

    for (i = 0; i < a_all_cookies.length; i++) {
        a_temp_cookie = a_all_cookies[i].split('=');
        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

        if (cookie_name == check_name) {
            b_cookie_found = true;
            if (a_temp_cookie.length > 1) {
                cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
            }
            return cookie_value;
            break;
        }
        a_temp_cookie = null;
        cookie_name = '';
    }
    if (!b_cookie_found) {
        return null;
    }
}
/*-----/home page chart snippets---*/
function OpenMergeFBAccountModal() {
    $('.ui-dialog').css('display', 'inline');
    $("#divPopup_MergeFBAccount").dialog({
        modal: true,
        width: 498,
        height: 298,
        resizable: false,
        closeOnEscape: false,
        overlay: { backgroundcolor: "#000", opacity: 0.5 }
    });
    $('.ui-dialog-titlebar').css('display', 'none');
}
function CloseMergeFBAccountModal() {
    $('.ui-dialog').css('display', 'none');
    $('.ui-widget-overlay').css('display', 'none');
}
function readCookieViewerStatus(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return "";
}
function fcnBackToTop() { $('body,html').animate({ scrollTop: 0 }, 800); }
function fcnDownToNextSection(targetSection) {
    var destination = $('#' + targetSection).offset().top;
    $('body,html').animate({ scrollTop: destination }, 800);
    if (targetSection == "h2additionalSearch") {
        var rbBetweenDatesChecked = $("#rbBetweenDates").attr("checked");

        if (rbBetweenDatesChecked == "checked") {
            $("#Dates_StartYear").val("");
            $("#Dates_StartMonth").val("");
            $("#Dates_StartDay").val("");
            $("#Dates_BetweenStartYear").val("");
            $("#Dates_BetweenEndYear").val("");

        }
    }


}
function fcnUpdateSortingOption(value) {
    var date = new Date();
    var today = new Date((date.getFullYear() + 1), date.getMonth(), date.getDate());
    document.cookie = ".newspaperarchive.com/SortingOption=sort=" + value + "; expires=" + today.toUTCString() + "; path=/";
}
function fcnChangeBrowseResultsPerPageCount(ctl) {
    var ctlVal = ctl.value;
    $("#hdnRecordsPerPage").val("" + ctlVal + "");
    $("#divbrowse form").submit();
}
function fcnPaginationPost() {
    if ($("#hdnOriginalUrl") != null) {
        var _url = $("#hdnOriginalUrl").val();
        if (_url != null && _url != "") {
            var stateObj = { foo: "bar" };
            history.pushState(stateObj, "BrowseLocation", "http://" + _url);
        }
    }
    $("a.paginationBtn").click(function () {
        var _pageActive = $(this).attr("class").toString();
        if (_pageActive.length > 0 && _pageActive.toLowerCase().indexOf("disabled") >= 0) {
            return false;
        }
        var _pageNum = $(this).text();
        if (_pageNum.length > 0 && _pageNum == "Next") {
            _pageNum = $('a.paginationBtnActive').text();
            if (_pageNum.length > 0) {
                _pageNum = Number(_pageNum) + 1;
            }
        }
        if (_pageNum.length > 0 && _pageNum == "Prev") {
            _pageNum = $('a.paginationBtnActive').text();
            if (_pageNum.length > 0) {
                _pageNum = Number(_pageNum) - 1;
            }
        }
        $("#PageNum").val("" + _pageNum + "");
        $("#divbrowse form").submit();
        return false;
    });
    $("a.aBrArticle").click(function () {
        var _titleInitial = $(this).attr("aria-label").toString();
        $("#hdnTitleInitial").val("" + _titleInitial + "");
        if (_titleInitial != null && _titleInitial != "") {
            $("#hdnOriginalUrl").val(DomainName + "/BrowseArticles/" + _titleInitial);
        }
        $("#divbrowse form").submit();
        return false;
    });
    $("a.aBrLocation").click(function () {
        var _StateId = $(this).attr("aria-label").toString();
        $("#Location_StateID").val("" + _StateId + "");
        $("#hdnStateId").val("" + _StateId + "");
        $("#hdnCountryId").val('7');
        if (_StateId != null && _StateId != "") {
            $("#hdnOriginalUrl").val(DomainName + "/BrowseLocations/c7/s" + _StateId);
        }
        $("#divbrowse form").submit();
        return false;
    });
    $("a.aBrDate").click(function () {
        var _YearRange = $(this).attr("aria-label").toString();
        if (_YearRange != null && _YearRange != "") {
            var YrRange = _YearRange.split("-");
            if (YrRange.length > 0) {
                $("#hdnStartYear").val("" + YrRange[0] + "");
                $("#hdnEndYear").val("" + YrRange[1] + "");
                $("#hdnOriginalUrl").val(DomainName + "/BrowseDate/StartYear-" + YrRange[0] + "/EndYear-" + YrRange[1]);
            }
        }
        $("#divbrowse form").submit();
        return false;
    });
}
function ValidateDefaultDayPhone(ctrlButtonId, ctrlKeyword) {
    var textbox = $("#" + ctrlKeyword + " ").val();
    if ($.trim(typeof textbox) == 'undefined' || $.trim(textbox) == "")
    { alert('Please enter your phone number'); }
    else {
        var _validateurl = "http://" + DomainName + "/Common/PhoneNumberValidation";
        var URL = "http://" + DomainName + "/DefaultBillingInfoControlPost/DefaultDayPhoneControlPost";
        //$.ajax({
        //    cache: false,
        //    type: "GET",
        //    url: _validateurl,
        //    data: { "phone": textbox },
        //    success: function (data) {
        //        if (data != null && $.trim(data.Message) == "false") { alert("Please enter valid phone number."); }
        //        else if (data != null && $.trim(data.Message) == "true") {
        //        } else { alert('Failed, please try again later.'); }
        //    },
        //    error: function (ex) {
        //        ExceptionHandling(ex);
        //    }
        //    //error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); }
        //});
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: { "phone": textbox },
            success: function (data) {
                if (data != null && data == "success") {
                    alert('Thank you for submitting your phone number.');

                    var popupContainer = $(".thickBoxArea");
                    popupContainer.fadeTo(600, 0, function () {
                        popupContainer.remove();
                    });

                    var url = "http://" + DomainName;
                    if ($("#cu").length > 0) { url = "http://" + DomainName + $("#cu").val().toLowerCase(); }
                    else if (parent.$("#cu").length > 0) { url = "http://" + DomainName + parent.$("#cu").val().toLowerCase(); }
                    //_gaq.push(['_setSampleRate', '25']);
                    _gaq.push(['_setSiteSpeedSampleRate', 8]);
                    _gaq.push(['_trackEvent', 'DayPhonePopup', 'Phone Number Submit', url, 1]);

                    $("#divDefaultDayPhone").click();
                }
                else {
                    alert(data);
                    return true;
                }
            },
            error: function (ex) {
                ExceptionHandling(ex);
                return true;
            }
            // error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); }
        });

    }
    return false;
}
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode != 32 && charCode != 45)
        return false;
    return true;
}
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}
/*//Added by Sujoy Guha on 03/09/2012*/
function weeklyperspectivesendmail(emailcontroll) {
    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var email = $("#" + emailcontroll).val();
    if (email == null || $.trim(email) == "" || $.trim(typeof email) == "undefined") { alert("Please enter email address"); }
    else if (!pattern.test(email)) { alert('Please enter valid email address'); }
    else {
        $.ajax({
            url: "http://" + DomainName + "/Weeklyperspective/EmailSend",
            type: "GET",
            data: { Emailadd: email },
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            error: function (xhr) { alert("You have failed registeration"); },
            success: function (result) {
                if (result == 1) { alert("You have sucessfully registered"); }
                else { alert("You have failed registeration"); }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
        });
    }
}
/*//Sujoy Guha End*/
/*///==========Debasis==========*/
function setSocialButtons() {
    /*--------------- JavaScript to get social buttons -----------------------*/
    if ($('#socialnetcontrol').length > 0) {
        !function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0]; if (!d.getElementById(id)) {
                js = d.createElement(s); js.id = id; js.src = "//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
            }
        }(document, "script", "twitter-wjs");
        (function () {
            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
        })();
    }
}
/*//===========End*/
/**********************************************Sujoy added for Newly added content************************/

function NewcountryChange(ctrlCountry, ctrlState, url) {
    $(ctrlCountry).change(function () {
        var selectedItem = $(ctrlCountry).val();
        var ddlStates = $(ctrlState);
        $("#hdnCountryId").val(selectedItem);

        if ($("#NewLocation_newaddcountryID").length > 0) {
            if ($('#NewLocation_newaddcountryID').val() != "") { $('#NewLocation_IsPublicationLocation').attr('checked', 'checked'); } else { $('#NewLocation_IsPublicationLocation').removeAttr('checked'); }
        }
        ddlStates.html('');
        ddlStates.append($("<option value=\"0\">State</option>"));
        if ($("#NewLocation_newaddcityID").length > 0) {
            $("#NewLocation_newaddcityID").html('');
            $("#NewLocation_newaddcityID").append($("<option value=\"0\">City</option>"));
        }

        if ($("#NewLocation_newaddpubID").length > 0) {
            $("#NewLocation_newaddpubID").html('');
            $("#NewLocation_newaddpubID").append($("<option value=\"0\">Publication</option>"));
        }

        if (selectedItem != "") {
            var statesProgress = $("#loading-progress");
            $.ajax({
                type: "GET",
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                url: url,
                data: { "countryId": selectedItem, "addEmptyStateIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlStates.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                },
                error: function (ex) {
                    ExceptionHandling(ex);
                }
                // error: function (xhr) { alert('Error: ' + xhr.statusText); }
            });
        }
    });
    if ($.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/tags") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/people") != 0 && $.trim(document.URL).toLowerCase().indexOf("http://" + DomainName + "/browse") != 0) {
        if ($("#NewLocation_newaddcountryID").length > 0) {
            $('#NewLocation_newaddcountryID').val("");
        }
    }

    if (document.URL == "http://" + DomainName + "/") {
        if ($("#BirthLocation_countryID").length > 0) { $("#BirthLocation_countryID").val(""); }
        if ($("#FuneraltLocation_countryID").length > 0) { $("#FuneraltLocation_countryID").val(""); }
        if ($("#MarriageLocation_countryID").length > 0) { $("#MarriageLocation_countryID").val(""); }
    }
}

function NewstateChange(ctrlCountry, ctrlState, ctrlCity, url) {
    $(ctrlState).change(function () {
        var selectedItem = $(ctrlState).val();
        var country = $(ctrlCountry).val();
        var ddlCities = $(ctrlCity);
        $("#hdnStateId").val(selectedItem);
        if ($("#NewLocation_newaddstateID").length > 0) {
            if ($('#NewLocation_newaddstateID').val() != "") { $('#NewLocation_IsPublicationLocation').attr('checked', 'checked'); } else { $('#NewLocation_IsPublicationLocation').removeAttr('checked'); }
        }
        if ($("#NewLocation_newaddcountryID").length > 0) {
            if ($('#NewLocation_newaddcountryID').val() != "") { $('#NewLocation_IsPublicationLocation').attr('checked', 'checked'); } else { $('#NewLocation_IsPublicationLocation').removeAttr('checked'); }
        }
        ddlCities.html('');
        ddlCities.append($("<option value=\"0\">City</option>"));

        if ($("#NewLocation_newaddpubID").length > 0) {
            $("#NewLocation_newaddpubID").html('');
            $("#NewLocation_newaddpubID").append($("<option value=\"0\">Publication</option>"));
        }

        if (selectedItem != "" && country != "") {
            var statesProgress = $("#loading-progress");
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: { "countryId": country, "stateId": selectedItem, "addEmptyStateIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlCities.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                },
                error: function (ex) {
                    ExceptionHandling(ex);
                }
                //error: function (xhr, ajaxOptions, thrownError) {
                //}
            });
        }
    });
}

function NewcityChange(ctrlCountry, ctrlState, ctrlCity, ctrlTitle, url) {

    $(ctrlCity).change(function () {
        var selectedItem = $(ctrlCity).val();
        var country = $(ctrlCountry).val();
        var state = $(ctrlState).val();
        var ddlTitles = $(ctrlTitle);
        $("#hdnCityId").val(selectedItem);
        if ($("#NewLocation_newaddstateID").length > 0) {
            if ($('#NewLocation_newaddstateID').val() != "") { $('#NewLocation_IsPublicationLocation').attr('checked', 'checked'); } else { $('#NewLocation_IsPublicationLocation').removeAttr('checked'); }
        }
        if ($("#NewLocation_newaddcountryID").length > 0) {
            if ($('#NewLocation_newaddcountryID').val() != "") { $('#NewLocation_IsPublicationLocation').attr('checked', 'checked'); } else { $('#NewLocation_IsPublicationLocation').removeAttr('checked'); }
        }
        if ($("#NewLocation_newaddcityID").length > 0) {
            if ($('#NewLocation_newaddcityID').val() != "") { $('#NewLocation_IsPublicationLocation').attr('checked', 'checked'); } else { $('#NewLocation_IsPublicationLocation').removeAttr('checked'); }
        }
        ddlTitles.html('');
        ddlTitles.append($("<option value=\"0\">Publication</option>"));
        if (state != "" && country != "" && selectedItem != "") {
            var Progress = $("#loading-progress");
            $.ajax({
                type: "GET",
                url: url,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: { "countryId": country, "stateId": state, "cityId": selectedItem, "addEmptyStateIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlTitles.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                },
                error: function (ex) {
                    ExceptionHandling(ex);
                }
                //error: function (xhr, ajaxOptions, thrownError) {
                //}
            });
        }
    });
}

/**********************************************Sujoy added for Newly added content************************/
/*********************************************For free registration by Moni**************************************/
function becomeFreeMemberOpenPopup() {
    var _freepopup = "http://" + DomainName + "/commonpopup/FreeRegistrationWithPwd";
    if ($("#hdnallfreepop").length > 0) { _freepopup = "http://" + DomainName + "/" + $("#hdnallfreepop").val(); }
    var PaymentVal = readCookieValue("NewspaperARCHIVE.com.User.PaymentAttempt");
    if (PaymentVal != null && PaymentVal.length > 0) {
        var _PaymentCount = readFromString(PaymentVal, "PaymentCount");
        if (parseInt(_PaymentCount) > 1) {
            openPopup(_freepopup + "?r=" + Math.floor(Math.random() * 10001), 800, true);
        }
        else {
            if ($("#hdnPaymentMode").length > 0 && ($("#hdnPaymentMode").val() == "PaidVersion")) { top.window.location = _becomememberpage; }
            else { openPopup(_freepopup + "?r=" + Math.floor(Math.random() * 10001), 800, true); }
        }
    }
    else {
        if ($("#hdnPaymentMode").length > 0 && ($("#hdnPaymentMode").val() == "PaidVersion")) { top.window.location = _becomememberpage; }
        else { openPopup(_freepopup + "?r=" + Math.floor(Math.random() * 10001), 800, true); }
    }
}
function FreeRegistrationSection(ctrlFirstName, ctrlLastname, ctrlEmailAddress) {
    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var firstname = $("#" + ctrlFirstName + " ").val();
    var lastname = $("#" + ctrlLastname + " ").val();
    var emailaddress = $("#" + ctrlEmailAddress + " ").val();
    var emailValueClean = emailaddress.replace(/ /gi, "");
    var pwd = ""; var confirmpwd = "";
    if ($("#Password").length > 0) { pwd = $("#Password").val(); }
    if ($("#ConfirmPassword").length > 0) { confirmpwd = $("#ConfirmPassword").val(); }

    var check = 0;
    if ($.trim(typeof firstname) == 'undefined' || $.trim(firstname) == "") { alert('Please enter your first name'); check = 1; return false; }
    else if ($.trim(typeof lastname) == 'undefined' || $.trim(lastname) == "") { alert('Please enter your last name'); check = 1; return false; }
    else if ($.trim(typeof emailValueClean) == 'undefined' || (emailValueClean.length <= 2)) { alert('Please enter your email address'); check = 1; return false; }
    else if (!pattern.test(emailValueClean)) { alert('Please enter valid email address'); check = 1; return false; }
    else if ($("#Password").length > 0) {
        if ($.trim(typeof pwd) == 'undefined' || $.trim(pwd) == "") { alert('Please enter password'); check = 1; return false; }
        if ($("#ConfirmPassword").length > 0) {
            if ($.trim(typeof confirmpwd) == 'undefined' || $.trim(confirmpwd) == "") { alert('Please enter confirm password'); check = 1; return false; }
            else if ($.trim(pwd) != $.trim(confirmpwd)) { alert('The password and confirmation password do not match'); check = 1; return false; }
        }
    }
    if (check == 0) {
        if ($("#areg").length > 0) { $("#areg").attr("class", "hidden"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", "http://" + DomainName + "/content/images/ajax-loader.gif"); $("#freeregloading").removeClass("hidden"); } }
        var retURL = "";
        var URL = "http://" + DomainName + "/Common/FreeRegistrationForSERP?returnURL=" + retURL + "&random=" + Math.floor(Math.random() * 10001);
        var $form = $('#divfreeRegistration form');
        $.post(URL, $form.serializeArray())
                .done(function (data) {
                    data = data || {};
                    if (data != null && $.trim(data.Message) == "duplicate") { alert("The given email address already exists in database."); }
                    else if (data != null && $.trim(data.Message) == "success") {
                        var c = 0;
                        /* //////if ($("#divregboxes").length > 0) { c = 1; $("#divregboxes").html("<p>We have sent you an email with an activation link. Please click on it to activate your account.</p>"); }*/
                        /* //////if ($("#divregboxes1").length > 0) { c = 1; $("#divregboxes1").html("<div class=\"bodyBoxBottom sugnupPopupPanel\"><h2>We have sent you an email with an activation link. Please click on it to activate your account.</h2></div>"); }*/
                        /*//////if (c == 0) { alert("We have sent you an email. Please activate your account from that email."); }*/
                        /*//////if ($("#divpwdpopup").length > 0) { $("#divpwdpopup").removeClass("popupFormBlock2"); }*/

                        if ($("#returnSerp").length > 0) { retURL = $("#returnSerp").val().toLowerCase(); }
                        var redirect = "http://" + DomainName + "/DefaultBillingInfoControlPost/midfreecontactimporter?uid=" + $.trim(data.UserId) + "&returl=" + retURL;
                        top.window.location.href = redirect;
                    }
                    else { alert('Failed, please try again later'); }
                    if ($("#areg").length > 0) { $("#areg").attr("class", "btn btn-warning btn-large"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", ""); $("#freeregloading").attr("class", "hidden"); } }
                })
                .error(function () {
                    alert('Failed, please try again later.');
                    if ($("#areg").length > 0) { $("#areg").attr("class", "btn btn-warning btn-large"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", ""); $("#freeregloading").attr("class", "hidden"); } }
                });
        return true;
    }
    return false;
}
/*********************************************For free registration by Moni**************************************/
function MyAccountSettingsCountryChange() {
    if ($("#ddlcountry").val() == "US") {
        document.getElementById('divddlstate').style.display = '';
        document.getElementById('divProvince').style.display = 'none';
    } else {
        document.getElementById('divddlstate').style.display = 'none';
        document.getElementById('divProvince').style.display = '';
    }
}
/**************  Add By Debashis Tewary ********Start*******/
function newlocationstateChange(ctrlCountry, ctrlState, ctrlCity, url) {

    $(ctrlState).change(function () {
        var countryid = $(ctrlCountry).val();
        var stateid = $(ctrlState).val();
        var ddlCities = $(ctrlCity);

        if ($("#Location_StateID").length > 0) {
            if ($('#Location_StateID').val() != "") { $('#Location_IsPublicationLocation').attr('checked', 'checked'); } else { $('#Location_IsPublicationLocation').removeAttr('checked'); }
        }
        ddlCities.html('');
        ddlCities.append($("<option value=\"0\">City</option>"));

        if ($("#Location_PublicationTitleID").length > 0) {
            $("#Location_PublicationTitleID").html('');
            $("#Location_PublicationTitleID").append($("<option value=\"0\">Publication</option>"));
        }

        if (countryid != "") {
            var statesProgress = $("#loading-progress");
            statesProgress.show();
            $.ajax({
                cache: false,
                type: "GET",
                url: url,
                data: { "countryId": countryid, "stateId": stateid, "addEmptyStateIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlCities.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                    statesProgress.hide();
                },
                error: function (ex) {
                    ExceptionHandling(ex);
                }
                //error: function (xhr, ajaxOptions, thrownError) {
                //    statesProgress.hide();
                //}
            });
        }
    });
}

function newlocationcityChange(ctrlCountry, ctrlState, ctrlCity, ctrlTitle, url) {
    $(ctrlCity).change(function () {
        var countryid = $(ctrlCountry).val();
        var stateid = $(ctrlState).val();
        var cityid = $(ctrlCity).val();
        var ddlTitles = $(ctrlTitle);
        if ($("#Location_CityID").length > 0) {
            if ($('#Location_CityID').val() != "") { $('#Location_IsPublicationLocation').attr('checked', 'checked'); } else { $('#Location_IsPublicationLocation').removeAttr('checked'); }
        }
        ddlTitles.html('');
        ddlTitles.append($("<option value=\"0\">Publication</option>"));
        if (countryid != "") {
            var Progress = $("#loading-progress");
            Progress.show();
            $.ajax({
                cache: false,
                type: "GET",
                url: url,
                data: { "countryId": countryid, "stateId": stateid, "cityId": cityid, "addEmptyStateIfRequired": "true" },
                success: function (data) {
                    $.each(data, function (id, option) {
                        //Modified by: Amit Kumar Srivastava
                        //Modified date:22 Aug,2013
                        //purpose: When selecting 0 index showing no record found
                        if (option.id != 0) {
                            ddlTitles.append($('<option></option>').val(option.id).html(option.name));
                        }
                    });
                    Progress.hide();
                },
                error: function (ex) {
                    ExceptionHandling(ex);
                    Progress.hide();
                }
                //error: function (xhr, ajaxOptions, thrownError) {
                //    Progress.hide();
                //}
            });
        }
    });
}

/**************  Add By Debashis Tewary ********End*******/

/*------ Recent Saved Search Implementation @ Sep 21,2012---------------*/
function DeleteSearches(ID) {
    //Added By Vishant Garg
    //What - Added a code to hide the tooltip of delete image
    //Why - we need to hide tooltip when user clicks on delete image.
    $('div .tooltipElement').tooltip('hide');
    var URL = "http://" + DomainName + "/MyRecentSearches/DeleteRecentSearches/";
    $.ajax({
        cache: false,
        type: "POST",
        url: URL,
        data: { "addEmptyImageIfRequired": "true", "strRecentSearchesId": ID },
        success: function (data) {
            $("#myRecentSearches").html(data);
            // $("#myRecentSearches").load("http://" + DomainName + "/Common/MyRecentSearches?random=" + Math.floor(Math.random() * 10001));
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
        //error: function (xhr, ajaxOptions, thrownError) { }
    });
}
function DeleteSavedSearches(ID) {
    //var URL = "http://" + DomainName + "/Common/DeleteRecentSearches/";
    //debugger;
    //  DomainName = "localhost:50444";
    $('.ajax-loading-block-window').show("slow");
    var URL = "http://" + DomainName + "/DeleteSearch";
    $.ajax({
        cache: false,
        type: "POST",
        url: URL,
        data: { "addEmptyImageIfRequired": "true", "strRecentSearchesId": ID },
        success: function (data) {
            //changed by vishant garg on 7/8/2013.
            //Purpose- To prevent from extra calls to database.
            //$('a[href*=' + ID + ']').parents('aside').hide();
            $('div#div_mysearchcontain').html(data);
            $('.ajax-loading-block-window').hide("slow");
            //  document.location.href = "http://" + DomainName + "/mysavedsearches";
        },
        error: function (ex) {
            ExceptionHandling(ex);
            $('.ajax-loading-block-window').hide("slow");
        }
        //error: function (xhr, ajaxOptions, thrownError) { $('.ajax-loading-block-window').hide("slow"); }
    });
}
/*------ Recent Saved Search Implementation @ Sep 21,2012---------------*/

/***************************start added by Moni for login PDF viewer ********/
function changeLoginViewer(val) {
    var flashviewerpref = getCookie("NewspaperARCHIVE.com.viewertype");
    if (flashviewerpref != null && flashviewerpref != "") {
        delCookie("NewspaperARCHIVE.com.viewertype", -1);
        setCookie("NewspaperARCHIVE.com.viewertype", val, 365);
        window.parent.top.location.href = window.location.href;
    }
    else {
        setCookie("NewspaperARCHIVE.com.viewertype", val, 365);
        window.parent.top.location.href = window.location.href;
    }
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function setCookie(name, value, time) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + time);
    var value = escape(value) + ((time == null) ? "" : "; expires=" + exdate.toUTCString() + '; path=/');
    document.cookie = name + "=" + value;
}
function setCookieUnEscaped(name, value, time) {
    var exdate = new Date();
    if (time == 12) {
        var time1 = exdate.getTime();
        time1 += 12 * 3600 * 1000;
        exdate.setTime(time1);
    }
    else {
        exdate.setDate(exdate.getDate() + time);
    }
    var value = value + ((time == null) ? "" : "; expires=" + exdate.toUTCString() + '; path=/');
    document.cookie = name + "=" + value;
}
function setCookieUnEscapedExpiredHour(name, value, hour) {
    var exdate = new Date();
    var time = exdate.getTime();
    time += 60 * (60 * hour) * 1000;
    exdate.setTime(time);
    var value = value + ((time == null) ? "" : "; expires=" + exdate.toGMTString() + '; path=/');
    document.cookie = name + "=" + value;
}

function delCookie(name, time) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + time);
    document.cookie = name + "=; expires=" + exdate.toUTCString();
}
/***************************end added by Moni for login PDF viewer ********/
/**********************Start Pdf viewer header icons by Moni on 27th Sep 2012*******************/
function reportaproblemOpenPop() { var i = $("#EncryptedImageId").val(); openPopup("http://" + DomainName + "/commonpopup/reportaproblem?imageid=" + i + "&random=" + Math.floor(Math.random() * 10001), 700); }
function reportaproblemSend() {
    var URL = "http://" + DomainName + "/reportaproblempost";
    var $form = $('#divReportAProblem form');
    $.post(URL, $form.serializeArray())
            .done(function (data) {
                data = data || {};
                if (data != null && $.trim(data) == "1") { alert("We have received your message, thank you."); $(".btnClose").click(); }
                else { alert("Mail sending has failed, Please enter valid input."); }
            })
            .error(function () {
                alert('Mail sending has failed, Please enter valid input.');
            });
}
function addtofilecabinetOpenPop(ImageId) {
    openPopup("http://" + DomainName + "/OpenTreasureBoxPopup?Imageid=" + ImageId + "&random=" + Math.floor(Math.random() * 10001), 700);
}
function SaveFileInTreasureBox(obj) {
    var Fid = $("#SelectID").val();
    if (Fid == null || Fid == "")
        Fid = 0;
    var Title = $("#MyArchiveId").val();
    var Imagid = $("#ImageId").val();
    var UserId = $("#UserId").val();
    var msg = Imagid + '|' + Fid + '|' + Title + '|' + UserId
    if (Title != '') {
        $.ajax({
            url: "http://" + DomainName + "/SaveInTreasureBox",
            data: { Message: msg },
            dataType: 'json',
            traditional: true,
            type: 'POST',
            success: function (data) {
                if (obj == "True") {
                    top.window.location.replace("http://" + DomainName + "/mytreasureBox");
                }
                else {
                    $(".btnClose").click();
                }
            },
            error: function (ex) {
                $(".btnClose").click();
                ExceptionHandling(ex);
            }
        });
    }
    else {
        alert('File name is required.');
    }
}
//function SaveFileInTreasureBox(obj) {
//    var Fid = $("#SelectID").val();
//    if (Fid == null || Fid == "")
//        Fid = 0;
//    var Title = $("#MyArchiveId").val();
//    var Imagid = $("#ImageId").val();
//    var UserId = $("#UserId").val();
//    var msg = Imagid + '|' + Fid + '|' + Title + '|' + UserId
//    $.ajax({
//        url: "http://" + DomainName + "/SaveInTreasureBox",
//        data: { Message: msg },
//        dataType: 'json',
//        traditional: true,
//        type: 'POST',
//        success: function (data) {
//            if (obj == "True") { top.window.location.replace("http://" + DomainName + "/mytreasureBox"); }
//        },
//        error: function (ex) {
//            ExceptionHandling(ex);
//        }
//    });
//}
function addtomyarchiveOpenPop(ImageId) {
    // DomainName = "localhost:50444";
    openPopup("http://" + DomainName + "/commonpopup/OpenMyArchivePopup", 600);
}
function SavetoMyArchiveOpenPopupViewer(obj) {
    // DomainName = "localhost:50444";
    var userid = $("#hdnUserID").val();
    var imageid = $("#ImageID").val();
    $.ajax({
        url: "http://" + DomainName + "/SaveToMyArchiveViewer",
        data: { "img": imageid, "userid": userid, "IfRequired": "true" },
        dataType: 'json',
        traditional: true,
        type: 'GET',
        success: function (data) {
            if (data == "1") { alert("Successfully added to My Archive."); if (obj == "true") { top.window.location.href = "http://" + DomainName + "/myaccountarchive"; } }
            else if (data == "2" || data == "-1") { alert("No entries were added to My Archive. There are no slots are left.") }
            else { alert("Unable to add selected items to My Archive page. Please try again.") }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}
function EmbedEmailSend(ctrlFirstName, ctrlEmailAddress, ctrlMessage) {
    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var firstname = $("#" + ctrlFirstName + " ").val();
    var emailaddress = $("#" + ctrlEmailAddress + " ").val();
    var emailValueClean = emailaddress.replace(/ /gi, "");

    var check = 0;
    if ($.trim(typeof firstname) == 'undefined' || $.trim(firstname) == "") { alert('Please enter your name'); check = 1; return false; }
    else if ($.trim(typeof emailValueClean) == 'undefined' || (emailValueClean.length <= 2)) { alert('Please enter friends email address'); check = 1; return false; }
    else if (!pattern.test(emailValueClean)) { alert('Please enter valid email address'); check = 1; return false; }
    if (check == 0) {
        var URL = "http://" + DomainName + "/Common/EmbedEmailSend";
        var $form = $('#emailToFriend form');
        $.post(URL, $form.serializeArray())
                .done(function (data) {
                    data = data || {};
                    if (data != null && $.trim(data) == "success") { alert('Your mail has been successfully send.'); $(".btnClose").click(); }
                    else { alert('Failed, please try again later.'); }
                })
                .error(function () { alert('Mail sending has failed, Please enter valid input.'); });
        return true;
    }
    return false;
}
function GUID() {
    var S4 = function () {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
}
function ViewerfileCabinetOpenPop(i, ImageId, file) { openPopup("http://" + DomainName + "/ViewerfileCabinetOpenPop?i=" + i + "&filetype=" + file + "&Imageid=" + ImageId + "", 700); }
function SaveItemToFileCabinet(obj) {
    /*////_data[0] = "Image ID", _data[1] = "Folder Id", _data[2] = "File Title", _data[3] = "User Id", _data[4] = "File Type", _data[5] = "Translation"
    /// FileType = ClippedImage / Translation / pdf / Image*/
    var Fid = $("#SelectID").val();
    if (Fid == null || Fid == "")
        Fid = 0;
    var Title = $("#ImageTitle").val();
    var Imagid = $("#ImageTitle").val();
    if ($("#hdnfilecabinet").length > 0 && ($("#hdnfilecabinet").val().toLowerCase() == "clipped image")) { Imagid = $("#ClippedImageName").val(); }
    var UserId = $("#UserId").val();
    var filetype = (($("#FileTypeQuery").length > 0) ? $("#FileTypeQuery").val() : "");
    var translation = (($("#Translation").length > 0) ? $("#Translation").val() : "");

    var msg = Imagid + '|' + Fid + '|' + Title + '|' + UserId + '|' + filetype + '|' + translation;
    $.ajax({
        url: "http://" + DomainName + "/FileCabinetSave",
        data: { Message: msg },
        dataType: 'json',
        traditional: true,
        type: 'POST',
        success: function (data) {
            if (obj == "True") { top.window.location.href = "http://" + DomainName + "/MyTreasureBox"; }
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
    });
}
/**********************End Pdf viewer header icons by Moni on 27th Sep 2012*******************/
function selectLandingPageTab(displaytab, hidetab) {
    $("#" + displaytab + "").addClass("active");
    $("#" + hidetab + "").removeClass("active");

    if (displaytab == 'atab1') {
        $("#divlandingBannerTab1").removeClass("hidden");
        $("#divlandingBannerTab2").addClass("hidden");
    }

    if (displaytab == 'atab2') {
        $("#divlandingBannerTab1").addClass("hidden");
        $("#divlandingBannerTab2").removeClass("hidden");
    }
}
function SendMail() {
    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var URL = "http://" + DomainName + "/MainViewer/SharePage";
    var senderName = $("#FullName").val();
    var recName = $("#RecipientName").val();
    var recEmail = $("#RecipientEmail").val();
    var emailValueClean = recEmail.replace(/ /gi, "");
    var recMssg = $("#RecipientMessage").val();
    var imageID = $("#ImageID").val();
    var imagePath = $("#ImagePath").val();
    var publicationDate = $("#publicationDate").val();
    var publicationTitle = $("#publicationTitle").val();

    if (senderName == "") {
        alert("Enter Sender's Name");
        return false;
    }
    if (recName == "") {
        alert("Enter Recipient's Name");
        return false;
    }
    if (recEmail == "") {
        alert("Enter Recipient's Email");
        return false;
    }
    if (!pattern.test(emailValueClean)) { alert("Please enter valid email address"); return false; }

    if (recMssg == "") {
        alert("Enter Message");
        return false;
    }

    $.ajax({
        cache: false,
        type: "POST",
        url: URL,
        data: { "addEmptyImageIfRequired": "true", "senderName": senderName, "recName": recName, "recEmail": emailValueClean, "mssg": recMssg, "imageID": imageID, "imagePath": imagePath, "pubDate": publicationDate, "pubTitle": publicationTitle },
        success: function (data) {
            alert("Mail Sent Successfully");
            $("#btnShareCancel").click();
        },
        error: function (ex) {
            ExceptionHandling(ex);
        }
        //error: function (xhr, ajaxOptions, thrownError) {
        //    alert("Mail Sent Failed");
        //}
    });
}
function backbuttonSWF(ReturnSERP) {
    if (ReturnSERP == undefined) { ReturnSERP = ""; }
    var url = 'http://' + document.domain.toString() + '/' + ReturnSERP;
    if (ReturnSERP.length > 0) { top.window.location = url; }
    else { top.window.history.back(-1); }
}
function readCookieValue(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function readFromString(value, name) {
    var nameEQ = name + "=";
    var ca = value.split('&');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/*----------------- Start Affiliate traking Script added by Moni ---------------------*/
function affiliateGetCookie(c_name) {
    var i, x, y, IDcookies = document.cookie.split(";");
    for (i = 0; i < IDcookies.length; i++) {
        x = IDcookies[i].substr(0, IDcookies[i].indexOf("="));
        y = IDcookies[i].substr(IDcookies[i].indexOf("=") + 1); x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) { return unescape(y); }
    }
}
function affiliateSetCookie(c_name, value, exdays) {
    var date = new Date();
    date.setDate(date.getDate() + exdays);
    var c_value = (value) + ((exdays == null) ? "" : "; expires=" + date.toUTCString());
    document.cookie = c_name + "=" + c_value;
}
function affiliateCheckCookie() {
    if (affiliateGetUrlVars()["affiliate"] != null && affiliateGetUrlVars()["affiliate"] != "") {
        var Affiliateid = affiliateGetCookie("cookieAffiliate"); if (Affiliateid != null && Affiliateid != "") {
            var UpdateTime = new Date(); var Updatemonth = UpdateTime.getMonth() + 1;
            var Updateday = UpdateTime.getDate(); var Updateyear = UpdateTime.getFullYear();
            var Updatedate = Updateyear + "/" + Updatemonth + "/" + Updateday; Affiliateid = "Affiliateid=" + affiliateGetUrlVars()["affiliate"] + "&AffiliateDate=" + Updatedate; affiliateSetCookie("cookieAffiliate", Affiliateid, 365);
        }
        else {
            var currentTime = new Date();
            var month = currentTime.getMonth() + 1; var day = currentTime.getDate(); var year = currentTime.getFullYear();
            var Affiliatedate = year + "/" + month + "/" + day; Affiliateid = "Affiliateid=" + affiliateGetUrlVars()["affiliate"] + "&AffiliateDate=" + Affiliatedate;
            if (Affiliateid != null && Affiliateid != "") { affiliateSetCookie("cookieAffiliate", Affiliateid, 365); }
        }
    }
}
function affiliateGetUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) { hash = hashes[i].split('='); vars.push(hash[0]); vars[hash[0]] = hash[1]; }
    return vars;
}
/*----------------- End Affiliate traking Script added by Moni ----------------------*/
function savefilecabinetclick(val) {
    if ($("#hdnfilecabinet").length > 0) {
        if ($("#hdnfilecabinet").val() == "Saved Search") { trackSavedSearch(val); }
        else { SaveItemToFileCabinet(val); }
    }
    else { SaveItemToFileCabinet(val); }
}
/*--------------------------- 7 day free trial added by Moni on 2nd Nov 2012 Start --------------------------------*/
function SevenDayFreeTrialRegistration(ctrlFirstName, ctrlLastname, ctrlEmailAddress) {
    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var firstname = $("#" + ctrlFirstName + " ").val();
    var lastname = $("#" + ctrlLastname + " ").val();
    var emailaddress = $("#" + ctrlEmailAddress + " ").val();
    var emailValueClean = emailaddress.replace(/ /gi, "");
    var pwd = ""; var confirmpwd = "";
    if ($("#Password").length > 0) { pwd = $("#Password").val(); }
    if ($("#ConfirmPassword").length > 0) { confirmpwd = $("#ConfirmPassword").val(); }

    var check = 0;
    if ($.trim(typeof firstname) == 'undefined' || $.trim(firstname) == "") { alert('Please enter your first name'); check = 1; return false; }
    else if ($.trim(typeof lastname) == 'undefined' || $.trim(lastname) == "") { alert('Please enter your last name'); check = 1; return false; }
    else if ($.trim(typeof emailValueClean) == 'undefined' || (emailValueClean.length <= 2)) { alert('Please enter your email address'); check = 1; return false; }
    else if (!pattern.test(emailValueClean)) { alert('Please enter valid email address'); check = 1; return false; }
    else if ($("#Password").length > 0) {
        if ($.trim(typeof pwd) == 'undefined' || $.trim(pwd) == "") { alert('Please enter password'); check = 1; return false; }
        if ($("#ConfirmPassword").length > 0) {
            if ($.trim(typeof confirmpwd) == 'undefined' || $.trim(confirmpwd) == "") { alert('Please enter confirm password'); check = 1; return false; }
            else if ($.trim(pwd) != $.trim(confirmpwd)) { alert('The password and confirmation password do not match'); check = 1; return false; }
        }
    }
    if (check == 0) {
        if ($("#areg").length > 0) { $("#areg").attr("class", "hidden"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", "http://" + DomainName + "/content/images/ajax-loader.gif"); $("#freeregloading").removeClass("hidden"); } }
        var retURL = "";
        if ($("#cu").length > 0) { retURL = $("#cu").val().toLowerCase(); }
        else if (parent.$("#cu").length > 0) { retURL = parent.$("#cu").val().toLowerCase(); }

        var URL = "http://" + DomainName + "/Common/RegisterEmailCheck";
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: { "username": emailValueClean },
            success: function (data) {
                if (data != null && $.trim(data.Message) == "duplicate") { alert("The given email address already exists in database."); if ($("#areg").length > 0) { $("#areg").attr("class", "btn btn-warning btn-large"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", ""); $("#freeregloading").attr("class", "hidden"); } } }
                else if (data != null && $.trim(data.Message) == "success") {

                    var form = document.createElement("form");
                    form.setAttribute("method", "post");
                    form.setAttribute("action", "http://" + DomainName + "/BecomeMember/PostToSecure");

                    var user = "";
                    if ($("#hdnUserID").length > 0 && $("#hdnUserID").val() != "0") { user = $("#hdnUserID").val().toLowerCase(); }
                    else if (parent.$("#hdnUserID").length > 0 && $("#hdnUserID").val() != "0") { user = parent.$("#hdnUserID").val().toLowerCase(); }
                    var planid = "882"; if ($("#hdnPlanId").length > 0 && $("#hdnPlanId").val() != "0") { planid = $("#hdnPlanId").val().toLowerCase(); }

                    if (user != "" && user != "0") {
                        var hiddenField = document.createElement("input"); hiddenField.setAttribute("type", "hidden"); hiddenField.setAttribute("name", "userid"); hiddenField.setAttribute("value", user);
                        form.appendChild(hiddenField);
                    }
                    var hdnfirstname = document.createElement("input"); hdnfirstname.setAttribute("type", "hidden"); hdnfirstname.setAttribute("name", "firstname"); hdnfirstname.setAttribute("value", firstname);
                    var hdnlastname = document.createElement("input"); hdnlastname.setAttribute("type", "hidden"); hdnlastname.setAttribute("name", "lastname"); hdnlastname.setAttribute("value", lastname);
                    var hdnemail = document.createElement("input"); hdnemail.setAttribute("type", "hidden"); hdnemail.setAttribute("name", "emailaddress"); hdnemail.setAttribute("value", emailaddress);
                    var hdnplan = document.createElement("input"); hdnplan.setAttribute("type", "hidden"); hdnplan.setAttribute("name", "plan"); hdnplan.setAttribute("value", planid);
                    var hdnpass = document.createElement("input"); hdnpass.setAttribute("type", "hidden"); hdnpass.setAttribute("name", "password"); hdnpass.setAttribute("value", pwd);

                    if (retURL.length > 0) {
                        var hdnret = document.createElement("input"); hdnret.setAttribute("type", "hidden"); hdnret.setAttribute("name", "refpage"); hdnret.setAttribute("value", retURL);
                        form.appendChild(hdnret);
                    }

                    form.appendChild(hdnfirstname);
                    form.appendChild(hdnlastname);
                    form.appendChild(hdnemail);
                    form.appendChild(hdnplan);
                    form.appendChild(hdnpass);

                    /*//////var PaymentVal = readCookieValue("NewspaperARCHIVE.com.User.PaymentAttempt");*/
                    /*//////if (PaymentVal != null && PaymentVal.length > 0) {*/
                    /*//////    var _PaymentCount = readFromString(PaymentVal, "PaymentCount");*/
                    /*//////    if (_PaymentCount.length > 0) { setCookieUnEscaped("NewspaperARCHIVE.com.User.PaymentAttempt", "PaymentCount=" + (parseInt(_PaymentCount) + 1), 365); }*/
                    /*//////}*/
                    /*//////else { setCookieUnEscaped("NewspaperARCHIVE.com.User.PaymentAttempt", "PaymentCount=1", 365); }*/

                    document.body.appendChild(form);
                    form.submit();

                } else { alert('Failed, please try again later.'); if ($("#areg").length > 0) { $("#areg").attr("class", "btn btn-warning btn-large"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", ""); $("#freeregloading").attr("class", "hidden"); } } }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            //error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); if ($("#areg").length > 0) { $("#areg").attr("class", "btn btn-warning btn-large"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", ""); $("#freeregloading").attr("class", "hidden"); } } }
        });
        return true;
    }
    return false;
}
/*--------------------------- 7 day free trial added by Moni on 2nd Nov 2012 End --------------------------------*/
function SavedSearchesCheck() {
    if ($.trim($("#hdnclass_wrap").val()).toLowerCase() == "anonymous") {
        var _freepopup = "http://" + DomainName + "/commonpopup/FreeRegistrationWithPwd";
        if ($("#hdnallfreepop").length > 0) { _freepopup = "http://" + DomainName + "/" + $("#hdnallfreepop").val(); }
        if ($("#hdnPaymentMode").length > 0 && ($("#hdnPaymentMode").val() == "PaidVersion")) { top.window.location = _becomememberpage; }
        else { openPopup(_freepopup + "?r=" + Math.floor(Math.random() * 10001), 800, false, true); }
    }
    else { window.location.href = "http://" + DomainName + "/mysavedsearches"; }
}
function ClearSerpFormValues() {
    if ($("#FirstName").length > 0) { $("#FirstName").val(""); }
    if ($("#LastName").length > 0) { $("#LastName").val(""); }
    if ($("#AllOfTheWordsString").length > 0) { $("#AllOfTheWordsString").val(""); }
    if ($("#ExactPhraseString").length > 0) { $("#ExactPhraseString").val(""); }
    if ($("#AnyOfTheWordsString").length > 0) { $("#AnyOfTheWordsString").val(""); }
    if ($("#WithoutWordsString").length > 0) { $("#WithoutWordsString").val(""); }

    if ($("#Dates_IsPublicationDate").length > 0) { $('#Dates_IsPublicationDate').removeAttr('checked'); }
    if ($("#rbExactDates").length > 0) { $('#rbExactDates').removeAttr('checked'); }
    if ($("#rbBetweenYears").length > 0) { $('#rbBetweenYears').removeAttr('checked'); }
    if ($("#rbBetweenDates").length > 0) { $('#rbBetweenDates').removeAttr('checked'); }

    if ($("#Dates_IsExactDate").length > 0) { $('#Dates_IsExactDate').val("false"); }
    if ($("#Dates_IsBetweenYears").length > 0) { $('#Dates_IsBetweenYears').val("false"); }
    if ($("#Dates_IsBetweenDates").length > 0) { $('#Dates_IsBetweenDates').val("false"); }

    if ($("#Dates_StartYear").length > 0) { $("#Dates_StartYear").val(""); }
    if ($("#Dates_StartMonth").length > 0) { $("#Dates_StartMonth").val(""); }
    if ($("#Dates_StartDay").length > 0) { $("#Dates_StartDay").val(""); }

    if ($("#Dates_BetweenStartYear").length > 0) { $("#Dates_BetweenStartYear").val(""); }
    if ($("#Dates_BetweenEndYear").length > 0) { $("#Dates_BetweenEndYear").val(""); }

    if ($("#Dates_BetweenDatesYear").length > 0) { $("#Dates_BetweenDatesYear").val(""); }
    if ($("#Dates_BetweenDatesMonth").length > 0) { $("#Dates_BetweenDatesMonth").val(""); }
    if ($("#Dates_BetweenDatesDay").length > 0) { $("#Dates_BetweenDatesDay").val(""); }
    if ($("#Dates_EndYear").length > 0) { $("#Dates_EndYear").val(""); }
    if ($("#Dates_EndMonth").length > 0) { $("#Dates_EndMonth").val(""); }
    if ($("#Dates_EndDay").length > 0) { $("#Dates_EndDay").val(""); }

    if ($("#Location_IsPublicationLocation").length > 0) { $('#Location_IsPublicationLocation').removeAttr('checked'); }
    if ($("#Location_CountryID").length > 0) {
        $("#Location_CountryID").val("");
        if ($("#Location_StateID").length > 0) {
            $("#Location_StateID").html('');
            $("#Location_StateID").append($("<option value=\"0\">State</option>"));
        }
        if ($("#Location_CityID").length > 0) {
            $("#Location_CityID").html('');
            $("#Location_CityID").append($("<option value=\"0\">City</option>"));
        }
        if ($("#Location_PublicationTitleID").length > 0) {
            $("#Location_PublicationTitleID").html('');
            $("#Location_PublicationTitleID").append($("<option value=\"0\">Publication</option>"));
        }
    }
    if ($("#ResultsPage_PageCount").length > 0) { $("#ResultsPage_PageCount").val("10"); }
    if ($("#h2additionalSearch").length > 0) { fcnDownToNextSection('h2additionalSearch'); }
}
function opentermscondition() { openPopup("http://" + DomainName + "/commonpopup/TermsAndConditionPopup", 960); }
function openprivacypolicy() { openPopup("http://" + DomainName + "/commonpopup/PrivacyPolicyPopup", 960); }
/*--------------------------- Moni on 25th Feb 2013 Start --------------------------------*/
function BeginMembership(ctrlFirstName, ctrlLastname, ctrlEmailAddress) {
    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var firstname = $("#" + ctrlFirstName + " ").val();
    var lastname = $("#" + ctrlLastname + " ").val();
    var emailaddress = $("#" + ctrlEmailAddress + " ").val();
    var emailValueClean = emailaddress.replace(/ /gi, "");
    var pwd = ""; var confirmpwd = "";
    if ($("#Password").length > 0) { pwd = $("#Password").val(); }
    if ($("#ConfirmPassword").length > 0) { confirmpwd = $("#ConfirmPassword").val(); }

    var check = 0;
    if ($.trim(typeof firstname) == 'undefined' || $.trim(firstname) == "") { alert('Please enter your first name'); check = 1; return false; }
    else if ($.trim(typeof lastname) == 'undefined' || $.trim(lastname) == "") { alert('Please enter your last name'); check = 1; return false; }
    else if ($.trim(typeof emailValueClean) == 'undefined' || (emailValueClean.length <= 2)) { alert('Please enter your email address'); check = 1; return false; }
    else if (!pattern.test(emailValueClean)) { alert('Please enter valid email address'); check = 1; return false; }
    else if ($("#Password").length > 0) {
        if ($.trim(typeof pwd) == 'undefined' || $.trim(pwd) == "") { alert('Please enter password'); check = 1; return false; }
        if ($("#ConfirmPassword").length > 0) {
            if ($.trim(typeof confirmpwd) == 'undefined' || $.trim(confirmpwd) == "") { alert('Please enter confirm password'); check = 1; return false; }
            else if ($.trim(pwd) != $.trim(confirmpwd)) { alert('The password and confirmation password do not match'); check = 1; return false; }
        }
    }
    if (check == 0) {
        if ($("#areg").length > 0) { $("#areg").attr("class", "hidden"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", "http://" + DomainName + "/content/images/ajax-loader.gif"); $("#freeregloading").removeClass("hidden"); } }
        var retURL = "";
        if ($("#cu").length > 0) { retURL = $("#cu").val().toLowerCase(); }
        else if (parent.$("#cu").length > 0) { retURL = parent.$("#cu").val().toLowerCase(); }

        var URL = "http://" + DomainName + "/Common/RegisterEmailCheck";
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: { "username": emailValueClean },
            success: function (data) {
                if (data != null && $.trim(data.Message) == "duplicate") { alert("The given email address already exists in database."); if ($("#areg").length > 0) { $("#areg").attr("class", "btn btn-warning btn-large"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", ""); $("#freeregloading").attr("class", "hidden"); } } }
                else if (data != null && $.trim(data.Message) == "success") {
                    var form = document.createElement("form");
                    form.setAttribute("method", "post");
                    form.setAttribute("action", "http://" + DomainName + "/Registration/PostToSecure");

                    var user = "";
                    if ($("#hdnUserID").length > 0 && $("#hdnUserID").val() != "0") { user = $("#hdnUserID").val().toLowerCase(); }
                    else if (parent.$("#hdnUserID").length > 0 && $("#hdnUserID").val() != "0") { user = parent.$("#hdnUserID").val().toLowerCase(); }
                    var planid = "882"; if ($("#hdnPlanId").length > 0 && $("#hdnPlanId").val() != "0") { planid = $("#hdnPlanId").val().toLowerCase(); }

                    if (user != "" && user != "0") {
                        var hiddenField = document.createElement("input"); hiddenField.setAttribute("type", "hidden"); hiddenField.setAttribute("name", "userid"); hiddenField.setAttribute("value", user);
                        form.appendChild(hiddenField);
                    }
                    var hdnfirstname = document.createElement("input"); hdnfirstname.setAttribute("type", "hidden"); hdnfirstname.setAttribute("name", "firstname"); hdnfirstname.setAttribute("value", firstname);
                    var hdnlastname = document.createElement("input"); hdnlastname.setAttribute("type", "hidden"); hdnlastname.setAttribute("name", "lastname"); hdnlastname.setAttribute("value", lastname);
                    var hdnemail = document.createElement("input"); hdnemail.setAttribute("type", "hidden"); hdnemail.setAttribute("name", "emailaddress"); hdnemail.setAttribute("value", emailaddress);
                    var hdnplan = document.createElement("input"); hdnplan.setAttribute("type", "hidden"); hdnplan.setAttribute("name", "plan"); hdnplan.setAttribute("value", planid);
                    var hdnpass = document.createElement("input"); hdnpass.setAttribute("type", "hidden"); hdnpass.setAttribute("name", "password"); hdnpass.setAttribute("value", pwd);

                    if (retURL.length > 0) {
                        var hdnret = document.createElement("input"); hdnret.setAttribute("type", "hidden"); hdnret.setAttribute("name", "refpage"); hdnret.setAttribute("value", retURL);
                        form.appendChild(hdnret);
                    }

                    form.appendChild(hdnfirstname);
                    form.appendChild(hdnlastname);
                    form.appendChild(hdnemail);
                    form.appendChild(hdnplan);
                    form.appendChild(hdnpass);

                    var PaymentVal = readCookieValue("NewspaperARCHIVE.com.User.PaymentAttempt");
                    if (PaymentVal != null && PaymentVal.length > 0) {
                        var _PaymentCount = readFromString(PaymentVal, "PaymentCount");
                        if (_PaymentCount.length > 0) { setCookieUnEscaped("NewspaperARCHIVE.com.User.PaymentAttempt", "PaymentCount=" + (parseInt(_PaymentCount) + 1), 365); }
                    }
                    else { setCookieUnEscaped("NewspaperARCHIVE.com.User.PaymentAttempt", "PaymentCount=1", 365); }

                    document.body.appendChild(form);
                    form.submit();

                } else { alert('Failed, please try again later.'); if ($("#areg").length > 0) { $("#areg").attr("class", "btn btn-warning btn-large"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", ""); $("#freeregloading").attr("class", "hidden"); } } }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            //error: function (xhr, ajaxOptions, thrownError) { alert('Failed, please try again later.'); if ($("#areg").length > 0) { $("#areg").attr("class", "btn btn-warning btn-large"); if ($("#freeregloading").length > 0) { $("#freeregloading").attr("src", ""); $("#freeregloading").attr("class", "hidden"); } } }
        });
        return true;
    }
    return false;
}
/*--------------------------- Moni on 25th Feb 2013 End --------------------------------*/
function postToIframe(jiframe, url, params) {
    var name = jiframe.attr('name');
    var k, f;
    if (!name) { name = 'k' + Math.round(Math.random() * 9999); jiframe.attr('name', name); }
    f = $('<form id="jiframeForm" target="' + name + '" method="post" action="' + url + '"></form>');

    for (k in params) { f.append('<input name="' + k + '" value="' + params[k] + '" type="hidden" />'); }
    $('#divflashViewer').append(jiframe);
    $('body').append(f);
    f.submit();
    $('#jiframeForm').remove();
}

function PubShowSubscribeNow(SubscribeNowStatus) {
    var urlFlashViewer = "http://" + DomainName + "/commonpopup/FreeViewerPopupNew632";
    var PaymentVal = readCookieValue("NewspaperARCHIVE.com.User.PaymentAttempt");
    if (PaymentVal != null && PaymentVal.length > 0) {
        var _PaymentCount = readFromString(PaymentVal, "PaymentCount");
        if (parseInt(_PaymentCount) > 1) { urlFlashViewer = "http://" + DomainName + "/commonpopup/NewMemberlockdownViewer"; }
    }
    var name = 'k' + Math.round(Math.random() * 9999);
    if (SubscribeNowStatus == 1) {
        $('#divflashViewer').html('<iframe id="loadflashpdf" src="' + urlFlashViewer + '" frameborder="0" height="700" width="100%" marginheight="0" marginwidth="0" scrolling="no" name="' + name + '"></iframe>');
    }
}
function redirectPDFViewerPageNumber(pageNo) {
    var pubDate = $("#publicationDate").val();
    var pubTitle = $("#publicationTitle").val();
    var _retTag = "";
    if (parent.$("#TagPagination").length > 0) { _retTag = parent.$("#TagPagination").val().replace(" ", "+"); }
    var pageNo = pageNo;
    var url = "";
    if (pageNo == 1) { url = "http://" + DomainName + "/" + pubTitle + "/" + pubDate + _retTag; }
    else { url = "http://" + DomainName + "/" + pubTitle + "/" + pubDate + "/page-" + pageNo + _retTag; }
    window.location = url;
}

/*--------------------------- Kanchan on 14th March 2013 Start --------------------------------*/
function ChangeNextOrPrevious(pageNo) {
    var imageId = $("#pdfPgaes").val();
    var title = $("#publicationTitle").val();
    var pubDate = $("#publicationDate").val();
    if (pageNo == "0") {
        parent.location.href = "http://" + DomainName + "/IIPFullViewer?img=" + imageId;
    }
    else {
        var URL = "http://" + DomainName + "/MainViewer/PreviousNextLinks";
        $.ajax({
            cache: false,
            type: "POST",
            url: URL,
            data: { "pageNo": pageNo, "imageId": imageId, "title": title, "pubDate": pubDate },
            success: function (data) {
                if (data != "") {
                    parent.location.href = "http://" + DomainName + "/IIPFullViewer?img=" + data;
                }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            // error: function (xhr, ajaxOptions, thrownError) { alert('Failed to navigate, please try again.'); }
        });
        return true;
    }
}
/*--------------------------- Kanchan on 14th March 2013 End --------------------------------*/

/*--------------------------- Moni on 18th March 2013 START --------------------------------*/
function MyAccountBillingAlterCC() {
    var ccType = $("#SelectCreditCard");
    var ccNo = $("#SecondaryCreditCardNo");
    var cvv = $("#SecondaryCVV");
    var ccYear = $("#SelectCCYear");
    var ccMonths = $("#SelectCCMonth");

    if ($.trim(ccType).length > 0 && $.trim(ccType.val()).toLowerCase() == "please select") { window.alert('Please enter a secondary credit card type.'); return false; }
    else if ($.trim(ccNo).length > 0 && $.trim(ccNo.val()).toLowerCase() == "") { window.alert('Please enter a secondary credit card number.'); return false; }
    else if (!validateCreditCard($.trim(ccNo.val()))) { alert('Enter a valid Credit Card Number'); }
        /* ////else if ($.trim(cvv).length > 0 && $.trim(cvv.val()).toLowerCase() == "") { window.alert('Please enter a secondary credit card CVV.'); return false; }*/
    else if ($.trim(ccYear).length > 0 && $.trim(ccYear.val()).toLowerCase() == "year") { window.alert('Please select a secondary credit card expiration year.'); return false; }
    else if ($.trim(ccMonths).length > 0 && $.trim(ccMonths.val()).toLowerCase() == "month") { window.alert('Please select a secondary credit card expiration month.'); return false; }
    else {
        var URL = "http://" + DomainName + "/SecondaryCreditCardSave";
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: {
                "userAccountId": $.trim($("#MyAccountID").val()), "billingAddressId": $.trim($("#CreditCardInformation_BillingAddressId").val()),
                "cardType": $.trim($("#SelectCreditCard").val()), "cardNumber": $.trim($("#SecondaryCreditCardNo").val()), "cvvCode": $.trim($("#SecondaryCVV").val()),
                "expiredMonth": $.trim($("#SelectCCMonth").val()), "expiredYear": $.trim($("#SelectCCYear").val())
            },
            success: function (data) {
                if (data != null) {
                    if ($.trim(data) == "1") { alert("Your secondary credit card information has been successfully saved."); }
                    else { alert("Failed, please try again later."); }
                }
                else { alert("Failed, please try again later."); }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            // error: function (xhr, ajaxOptions, thrownError) { alert("Failed, please try again later."); }
        });
        return true;
    }
}
function validateCreditCard(s) {
    // remove non-numerics
    var v = "0123456789";
    var w = "";
    for (i = 0; i < s.length; i++) {
        x = s.charAt(i);
        if (v.indexOf(x, 0) != -1)
            w += x;
    }
    // validate number
    j = w.length / 2;
    if (j < 6.5 || j > 8 || j == 7) return false;
    k = Math.floor(j);
    m = Math.ceil(j) - k;
    c = 0;
    for (i = 0; i < k; i++) {
        a = w.charAt(i * 2 + m) * 2;
        c += a > 9 ? Math.floor(a / 10 + a % 10) : a;
    }
    for (i = 0; i < k + m; i++) c += w.charAt(i * 2 + 1 - m) * 1;
    return (c % 10 == 0);
}
/*--------------------------- Moni on 18th March 2013 END --------------------------------*/
/*//This script function for show Embbed Code created by sujoy*/
function EmbedDivShow() {
    var divStatus = document.getElementById('EmbbedDiv').style.display;
    var divid = document.getElementById('EmbbedDiv');
    if (divStatus == 'none') { divid.style.display = 'block'; bindHTML(); }
    else { divid.style.display = 'none'; }
}
/*//End by sujoy*/
function bindHTML() {
    var dynamic_PageLink = $('#PageLink').val();
    var HeaderText = $('#HeaderTex').val();
    var HederLinke = $('#HeaderLinke').val();
    var HtmlCode = "<div style='text-align:center;'><div id='mainTemp' style='width:350px; margin:0 auto; text-align:center; font-family:Arial, Helvetica, sans-serif;'>";
    HtmlCode = HtmlCode + "<div style='background-color: #F6F6F6; padding:5px 10px;'><div>";
    HtmlCode = HtmlCode + "<img src='http://na.na-assets.com/content/images/seo_logo.png' alt='NewspaperArchive' />";
    HtmlCode = HtmlCode + "<div style='color: #e58585; padding:5px 0; font-size:13px; font-weight:bold;'><a style='text-decoration: none; color: #000000' href=" + HederLinke + " target='_blank'>" + HeaderText + "</a></div> </div>";
    HtmlCode = HtmlCode + "<iframe id='widget-iframe' src='" + dynamic_PageLink + "'scrolling='no' frameborder='0' style='height: 500px; width:330px;text-align:left;'></iframe></div>";
    HtmlCode = HtmlCode + "<div class='footer' style='background-color: #000000; padding:2px 2px 5px; font-size:13px;'><a href='http://newspaperarchive.com/' style='color:#000000; text-decoration:none;' target='_blank'>NewspaperARCHIVE</a></div></div></div>";
    $('#txtCodeContaint').val(HtmlCode);
}

function adjustImgPrintColor() {
    $('.imgPrintColor').each(function () {
        var obj = $(this);
        obj.height(obj.next('img').height()).width(obj.next('img').width()).css({
            'marginLeft': -parseFloat(obj.next('img').width()) / 2
        });
    });
}
function popupOnload() {
    // Trace when called;
    adjustImgPrintColor();
    $(".cartBlock").each(function () {
        var vHdnValue = $(this).find(".hdnsetbg").val();
        if (vHdnValue == "") { $(this).find(".hdnsetbg").val(1); }
        var hdnName = $(this).find(".hdnsetbg").attr('name');
        $('div[data-name="' + hdnName + '"]').removeClass('colorRadioBoxSelected');
        $($('div[data-name="' + hdnName + '"]')[vHdnValue - 1]).addClass('colorRadioBoxSelected');
        $('div[data-pdf="' + hdnName + '"]').attr({ 'class': 'imgPrintColor imgPrintColorOpt' + vHdnValue });
        $('div[data-pdf="' + hdnName + '"]').css({ "height": "214px", "width": "171px", "margin-left": "-85.5px" });
    });

    $('.set-np-bg').click(function () {
        var name = $(this).attr('data-name');
        $('div[data-name="' + name + '"]').removeClass('colorRadioBoxSelected');
        $(this).addClass('colorRadioBoxSelected');
        $('input[name="' + name + '"]').val($(this).attr('data-value'));
        $('div[data-pdf="' + name + '"]').attr({ 'class': 'imgPrintColor imgPrintColorOpt' + $(this).attr('data-value') });
        adjustImgPrintColor();
        var _index = $('input[name="' + name + '"]').attr("id").replace('hdnset-bg-', '');
        var _val = $('input[name="' + name + '"]').val();
        $("#CartDetails_" + _index + "__ColorId option[value='" + _val + "']").attr("selected", "selected");
    });
}
$(window).resize(function () { adjustImgPrintColor(); });
function FileNotAvailable_treasurebox() { alert("This image has been removed at the request of the rights holder."); }
/*For Show - hide savedSearch searchresults div*/
function showHideResult(obj, ReferralUrl, anchorID) {
    ReferralUrl = decodeText(ReferralUrl);
    obj = $(obj);
    var flag = "0";
    if ($(anchorID).text() == "Hide Results") {
        flag = "1";
    }
    $('.ssBotKeywordBtns a').addClass('btnRed').html('Show Results');
    if (flag == "1") {
        $(anchorID).removeClass('btnRed').html('Hide Results');
    }
    $('div.ssResultBot').slideUp(400, function () { adjustVerticalScroll(); })

    if (obj.hasClass('btnRed')) {
        $(anchorID).removeClass('btnRed').html('Hide Results');
        $('.SingleSearchResultCount').html('');
        $('.SingleSearchResult').html('');
        $('.SingleSearchResultPagination').html('');
        $('.ajax-loading-block-window').show("slow");
        GetResultsAndPagination(ReferralUrl);
        obj.parent().parent().parent().next('div.ssResultBot').slideDown(400, function () { adjustVerticalScroll(); })
    } else {
        obj.addClass('btnRed').html('Show Results');
        obj.parent().parent().parent().next('div.ssResultBot').slideUp(400, function () { adjustVerticalScroll(); })
    }
    $(window).scrollTop($(anchorID).offset().top - 365);
    return false;
}
/*For Show - hide savedSearch searchresults div*/

/*--------------------------- Kanchan on 10th April 2013 Start --------------------------------*/
function GetResultsAndPagination(ReferralUrl) {
    // DomainName = "localhost:50444";
    var URL = "http://" + DomainName + "/SavedSearchsGetSingleSearch";
    $.ajax({
        cache: false,
        type: "POST",
        url: URL,
        data: { "RefUrl": ReferralUrl },
        success: function (data) {
            if (data != null) {
                var arr = data.split('$||$');
                if (arr[0] != "0") {
                    $('.ajax-loading-block-window').css('display', 'none');
                    $('.ssResultTopRow h5').show('slow');
                    $('.SingleSearchResultCount').html(arr[0]);
                    $('.SingleSearchResult').html(arr[1]);
                    $('.SingleSearchResultPagination').html(arr[2]);
                }
                else {
                    $('.ajax-loading-block-window').css('display', 'none');
                    $('.ssResultTopRow h5').css('display', 'none');
                    $('.SingleSearchResult').html('<h2>No Results Found.</h2>');
                }
            }
        },
        error: function (ex) {
            ExceptionHandling(ex);
            $('.ajax-loading-block-window').css('display', 'none');
            $('.ssResultTopRow h5').css('display', 'none');
            $('.SingleSearchResult').html('<h2>No Results Found.Please try again later.</h2>');
        }
        //error: function (xhr, ajaxOptions, thrownError) {
        //    $('.ajax-loading-block-window').css('display', 'none');
        //    $('.ssResultTopRow h5').css('display', 'none');
        //    $('.SingleSearchResult').html('<h2>No Results Found.Please try again later.</h2>');
        //}
    });
    return true;
}
/*--------------------------- Kanchan on 10th April 2013 End --------------------------------*/
//Created By Rachna Singh w.r.t task #20 
function ClosePopUpOnContinue() {
    $('div.btnClose').click();
}
function StoreRedirect() { parent.location.href = "http://" + DomainName + "/store"; }
function StoreCleanCartRedirect() {
    var url = "http://" + DomainName + "/store";
    if ($("#cu").length > 0) { url = "http://" + DomainName + $("#cu").val().toLowerCase(); }
    else if (parent.$("#cu").length > 0) { url = "http://" + DomainName + parent.$("#cu").val().toLowerCase(); }
    parent.location.href = url;
}
function postContactUs() {
    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var _name = $("#Name");
    var _mailId = $("#yourMailID").val();
    var emailValueClean = _mailId.replace(/ /gi, "");
    var _sub = $("#Selectsubject");
    var _msg = $("#Message");

    if ($.trim(_name).length > 0 && $.trim(_name.val()).toLowerCase() == "") { window.alert('Please enter your name.'); return false; }
    else if ($.trim(typeof emailValueClean) == 'undefined' || (emailValueClean.length <= 2)) { alert('Please enter your email address'); return false; }
    else if (!pattern.test(emailValueClean)) { alert('Please enter valid email address'); check = 1; return false; }
    else if ($.trim(_sub).length > 0 && ($.trim(_sub.val()).toLowerCase() == "select a subject" || $.trim(_sub.val()).toLowerCase() == "")) { window.alert('Please select subject.'); return false; }
    else if ($.trim(_msg).length > 0 && $.trim(_msg.val()).toLowerCase() == "") { window.alert('Please provide a message.'); return false; }
    else {
        var URL = "http://" + DomainName + "/postContactUs";
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: {
                "name": $.trim($("#Name").val()), "email": $.trim($("#yourMailID").val()),
                "country": $.trim($("#SelectCountryName").val()), "sub": $.trim($("#Selectsubject").val()), "msg": $.trim($("#Message").val())
            },
            success: function (data) {
                if (data != null) {
                    if ($.trim(data) == "1") {
                        alert("We have received your message. Thank you.");
                        $("#Name").val(""); $("#yourMailID").val(""); $("#Message").val(""); $("#SelectCountryName").val("United States"); $("#Selectsubject").val("");
                    }
                    else { alert("Failed, please try again later."); }
                }
                else { alert("Failed, please try again later."); }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            //error: function (xhr, ajaxOptions, thrownError) { alert("Failed, please try again later."); }
        });
        return true;
    }
}

function postWeeklyBlogComments() {
    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    var _name = $("#Personname");
    var _mailId = $("#emailaddress").val();
    var emailValueClean = _mailId.replace(/ /gi, "");
    var _msg = $("#capchCode");

    if ($.trim(_name).length > 0 && $.trim(_name.val()).toLowerCase() == "") { window.alert('Please enter your name.'); return false; }
    else if ($.trim(typeof emailValueClean) == 'undefined' || (emailValueClean.length <= 2)) { alert('Please enter your email address'); return false; }
    else if (!pattern.test(emailValueClean)) { alert('Please enter valid email address'); check = 1; return false; }
    else if ($.trim(_msg).length > 0 && $.trim(_msg.val()).toLowerCase() == "") { window.alert('Please enter the code.'); return false; }
    else {
        var URL = "http://" + DomainName + "/Weeklyperspective/CommentsWeeklyBlogs";
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: {
                "personname": $.trim($("#Personname").val()), "emailaddress": $.trim($("#emailaddress").val()),
                "Homepageurl": $.trim($("#Homepageurl").val()), "comment": $.trim($("#Comment").val()),
                "weeklyid": $.trim($("#weeklyid").val()), "capchCode": $.trim($("#capchCode").val())
            },
            success: function (data) {
                if (data != null) {
                    if ($.trim(data) == "Your post has been successfully saved!") {
                        alert($.trim(data));
                        //Commenting the below line by Rachna Singh on 2/Sep/2013 as below controls not used on 'CommentsPartialView.cshtml
                        // $("#Name").val(""); $("#yourMailID").val(""); $("#Message").val(""); $("#SelectCountryName").val("United States"); $("#Selectsubject").val("");
                        //Added below code by Rachna singh on 2/Sep/2013 to clear following controls w.r.t task #202
                        $("#Personname").val("");
                        $("#emailaddress").val("");
                        $("#Homepageurl").val("");
                        $("#Comment").val("");
                        $("#capchCode").val("");
                        //End Here
                    }
                    else { alert($.trim(data)); }
                }
                else { alert("Failed, please try again later."); }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            // error: function (xhr, ajaxOptions, thrownError) { alert("Failed, please try again later."); }
        });
        return true;
    }
}
/************************************ START added for G+ on 2nd May 2013 ****************************************/
function plusClick(data) {
    if (data.state == "on") { setCookie("NewspaperARCHIVE.com.maxpreview", 2, 1); }
    else if (data.state == "off") { setCookie("NewspaperARCHIVE.com.maxpreview", 1, 1); }
}
/***************************************** END added for G+ on 2nd May 2013 *****************************************/
function minmax(value, min, max) {
    //debugger;
    if (parseInt(value) < 1 || isNaN(value)) { return 1; }
    else if (parseInt(value) > 100) { return 100; }
    else { return value; }
}

/*//Value parameter - required. All other parameters are optional.*/
function isDate(value, sepVal, dayIdx, monthIdx, yearIdx) {
    try {
        value = value.replace(/-/g, "/").replace(/\./g, "/");
        sepVal = (sepVal === undefined ? "/" : sepVal.replace(/-/g, "/").replace(/\./g, "/"));

        var SplitValue = value.split(sepVal);
        if (SplitValue.length != 3) {
            return false;
        }

        /*//Auto  detection of indexes*/
        if (dayIdx === undefined || monthIdx === undefined || yearIdx === undefined) {
            if (SplitValue[0] > 31) {
                yearIdx = 0;
                monthIdx = 1;
                dayIdx = 2;
            } else {
                yearIdx = 2;
                monthIdx = 1;
                dayIdx = 0;
            }
        }

        /*//Change the below values to determine which format of date you wish to check. It is set to dd/mm/yyyy by default.*/
        var DayIndex = dayIdx !== undefined ? dayIdx : 0;
        var MonthIndex = monthIdx !== undefined ? monthIdx : 1;
        var YearIndex = yearIdx !== undefined ? yearIdx : 2;

        var OK = true;
        if (!(SplitValue[DayIndex].length == 1 || SplitValue[DayIndex].length == 2)) {
            OK = false;
        }
        if (OK && !(SplitValue[MonthIndex].length == 1 || SplitValue[MonthIndex].length == 2)) {
            OK = false;
        }
        if (OK && SplitValue[YearIndex].length != 4) {
            OK = false;
        }
        if (OK) {
            var Day = parseInt(SplitValue[DayIndex], 10);
            var Month = parseInt(SplitValue[MonthIndex], 10);
            var Year = parseInt(SplitValue[YearIndex], 10);
            var MonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            if (OK = (Month <= 12 && Month > 0)) {

                var LeapYear = (Year & 3) == 0 && ((Year % 25) != 0 || (Year & 15) == 0);
                MonthDays[1] = (LeapYear ? 29 : 28);

                OK = Day > 0 && Day <= MonthDays[Month - 1];
            }
        }
        return OK;
    }
    catch (e) {
        return false;
    }
}

function BrowseRefineSearchValidaion() {
    var fname = $("#FirstName").val();
    var lname = $("#LastName").val();
    var allWords = $("#AllOfTheWordsString").val();
    var exactWords = $("#ExactPhraseString").val();
    var leastOneWord = $("#AnyOfTheWordsString").val();
    var without = $("#WithoutWordsString").val();

    if ($.trim(without).length > 1) {
        if (($.trim(lname).length < 1) && $.trim(allWords) == "" && $.trim(exactWords) == "" && $.trim(leastOneWord) == "") {
            window.alert('Please enter search term(s). Search term(s) must be greater than 1 character.');
            return false;
        }
        else if ((($.trim(lname).length < 1) && ($.trim(allWords).length < 2) && ($.trim(exactWords).length < 2) && ($.trim(leastOneWord).length < 2))) {
            window.alert('Please enter search term(s).  Search term(s) must be greater than 1 character.');
            return false;
        }
        else { return true; }
    }
    else { return true; }
}
function UpdateShoppingCartNav() {
    if ($("#divShoppingCartNav").length > 0) { $('#divShoppingCartNav').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random" + Math.floor(Math.random() * 10001)); }
    if ($(".ulHeaderShoppingCart").length > 0) { $('.ulHeaderShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random=" + Math.floor(Math.random() * 10001)); }
    if ($(".divMyAccountShoppingCart").length > 0) { $('.divMyAccountShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigationMyAccount?random=" + Math.floor(Math.random() * 10001)); }
}
/*--------------------------- By Kanchan on 30th May 2013 --------------------------------*/
function FindSavedSearch() {
    //   DomainName = "localhost:50444";
    //Changed by vishant garg to encode text after validation.
    var SearchTerm = $('#txtSearchBox').val();
    var URL = "http://" + DomainName + "/BtnPostFindSearch";
    if (SearchTerm != "Search within your Saved Searches" && SearchTerm != "") {
        if (SearchTerm.length >= 2) {
            $('.ajax-loading-block-window').css('display', 'block');
            $.ajax({
                cache: false,
                type: "POST",
                url: URL,
                data: { "term": EncodeText(SearchTerm) },
                success: function (data) {
                    $('#div_mysearchcontain').html(data);
                    $('.ajax-loading-block-window').css('display', 'none');
                },
                error: function (ex) {
                    $('.ajax-loading-block-window').css('display', 'none');
                    ExceptionHandling(ex);
                }
                //error: function (xhr, ajaxOptions, thrownError) {
                //    $('.ajax-loading-block-window').css('display', 'none');
                //    alert("Please retry filtering again.");
                //}
            });
        }
        else {
            alert("Please enter a search keyword with atleast two characters.");
        }
    }
    else {
        alert("Please enter a search keyword.");
    }
}
/*--------------------------- By Kanchan on 30th May 2013 End--------------------------------*/


////******************** 4482  Rakesh Kumar For Shopping cart***************************************
//Below function is called on change of items Quantity in shopping cart.
function CalculateTotal(objQuantity, unitPrice) {
    var quantity = 0;
    //if (parseInt(objQuantity.value) < 1 || isNaN(objQuantity.value)) { quantity = 1; objQuantity.value = 1; }
    //Commented above line of code and added below after modifying w.r.t task #256
    if (parseInt(objQuantity.value) < 1 || isNaN(parseInt(objQuantity.value))) { quantity = 1; objQuantity.value = 1; }
    else if (parseInt(objQuantity.value) > 100) { quantity = 100; objQuantity.value = 100; }
    else { quantity = objQuantity.value; }

    //--------------------------------------------------------------------------          
    var totalPrice = quantity * unitPrice;
    var Id = [];
    Id = objQuantity.id.split('_');
    $("#spanTotalPrice_" + Id[1]).html("$" + totalPrice);

    //---------------------------------------------------------------------------
    i = 0;
    $("select[id^=dropdownShippingPackage_]").each(function () {
        var shippingPackageId = $("#dropdownShippingPackage_" + i).val();
        $("#hiddenShippingPackageId_" + i).val(shippingPackageId);
        i++;
    });

    j = 0;
    $("div .colorRadioBoxSelected").each(function () {
        var color = $('"div[id^=divColor_' + j + ']"').find("div .colorRadioBoxSelected").attr("data-value");
        //$("#hiddenColor_" + j).val(color);
        $("#hdnset - bg -" + j).val(color);
        j++;
    });
    // var shoppingCartItemId = $("#linkRemoveItem_" + Id[1]).attr("customShoppingCartItemsId");
    $("#hiddenFlag").val("1");
    $('#CartUpdatePricenew').click();
    //---------------------------------------------------------------------------
    return quantity;
}
function changevalue(value) {
    $("#hiddenFlag").val(value);
}



function GetPublicationId() {


    if ($("#Location_PublicationTitleID").val() != "") {
        $("#HdnLocationPublicationId").val($("#Location_PublicationTitleID").val());
    }

}
//Rakesh: this function is used to  delete the items from shoping cart using delete Icon
function RemoveItemFrommShopCart(shoppingcartitemid, img) {
    // debugger;
    if (shoppingcartitemid != '' && shoppingcartitemid != 'undefined') {
        if (confirm('Do you want to remove this item?')) {
            $(document).ready(function () {
                //  debugger;
                $('#DivResult').load('http://' + DomainName + '/ShoppingCart/CartRemoveItems?RemoveItem=' + shoppingcartitemid + '&Flag=RemoveSingleItem' + '&random' + Math.floor(Math.random() * 10001));
                ////Below is placed under the close button of pop up.
                //if ($("#divShoppingCart").length > 0) { debugger; $('#divShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCart?random" + Math.floor(Math.random() * 10001)); }
                //if ($("#divShoppingCartNav").length > 0) { debugger; $('#divShoppingCartNav').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random" + Math.floor(Math.random() * 10001)); }
                //if ($(".ulHeaderShoppingCart").length > 0) { debugger; $('.ulHeaderShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random=" + Math.floor(Math.random() * 10001)); }
                //if ($(".divMyAccountShoppingCart").length > 0) { debugger; $('.divMyAccountShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigationMyAccount?random=" + Math.floor(Math.random() * 10001)); }
                if (img != "" && img != "undefined") {
                    if ($('#btn_' + img + '').length > 0) {
                        $('#btn_' + img + '').attr('class', 'cart store');
                        $('#btn_' + img + '').attr("href", "javascript:addtoCart(" + img + ");");
                        $("#btn_" + img + "").text("add to cart");
                    }
                    if ($("#btn_store_" + img + "").length > 0) { $('#btn_store_' + img + '').attr("href", "javascript:addtoCart(" + img + ");"); }
                    if ($("#ds_" + img + "").length > 0) { $('#ds_' + img + '').attr('class', ''); }
                }
            });
        }

    }
    else { alert("Item cannot be removed."); }
}

//Added BY Rakesh : create the common Function and call it on  close button  of pop up 
function RefreshParentPage() {
    if ($("#divShoppingCart").length > 0) { $('#divShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCart?random" + Math.floor(Math.random() * 10001)); }
    if ($("#divShoppingCartNav").length > 0) { $('#divShoppingCartNav').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random" + Math.floor(Math.random() * 10001)); }
    if ($(".ulHeaderShoppingCart").length > 0) { $('.ulHeaderShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random=" + Math.floor(Math.random() * 10001)); }
    if ($(".divMyAccountShoppingCart").length > 0) { $('.divMyAccountShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigationMyAccount?random=" + Math.floor(Math.random() * 10001)); }
}

// this function is used to open the shopping cart pop up: By Rakesh
function shoppingCartdetails() {
    // DomainName = "localhost:50444";
    openPopup("http://" + DomainName + "/ShoppingCart/Index?r=" + Math.floor(Math.random() * 10001), 960);
}
// this function is used to add the items to the shopping cart
function addtoCart(id) {
    // debugger;
    //DomainName = "localhost:50444";
    if ($.trim(id) != 0) {
        var URL = "http://" + DomainName + "/ShoppingCart/AddtoShoppingCart?r=" + Math.floor(Math.random() * 10001);
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: { "imageId": id, "addEmptyImageIfRequired": "true" },
            success: function (data) {
                // debugger;
                if (data == 1) {
                    openPopup("http://" + DomainName + "/ShoppingCart/Index?random=" + Math.floor(Math.random() * 10001), 960);
                    if ($('#btn_' + id + '').length > 0) {
                        $('#btn_' + id + '').attr('class', 'btn btn-mini btn-success store');
                        $('#btn_' + id + '').attr("href", "javascript:shoppingCartdetails();");
                    }

                    if ($("#btn_store_" + id + "").length > 0) {
                        $("#btn_store_" + id + "").attr("href", "javascript:shoppingCartdetails();");
                    }

                    if ($('#apdfviewer_' + id + '').length > 0) { $("#apdfviewer_" + id + "").attr("onclick", "javascript:shoppingCartdetails();"); $("#apdfviewer_" + id + "").text("Added to Cart"); $("#apdfviewer_" + id + "").attr("class", "btn btn-success addCartBtn store"); }

                    var _store = "0";
                    if ($('#btn_' + id + '').length > 0) { $('#btn_' + id + '').text('Success'); }
                    if ($("#ds_" + id + "").length > 0) { $("#ds_" + id + "").attr("class", "cartIcon store"); }
                    // setting values in to Model : No DB hit : Rakesh
                    if ($("#divShoppingCart").length > 0) { $('#divShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCart?random=" + Math.floor(Math.random() * 10001)); }
                    if ($("#divBuyPopup").length > 0) { $("#divBuyPopup").addClass("hidden"); } // adding only class
                    //// Geting the Shopping cart information from DB as per the user Id.Below given Both are using the  actions having same code, but these are called Conditionaly. 
                    /// Below will be called on close of pop up.
                    // if ($(".ulHeaderShoppingCart").length > 0) { $('.ulHeaderShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random=" + Math.floor(Math.random() * 10001)); }
                    // if ($(".divMyAccountShoppingCart").length > 0) { $('.divMyAccountShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigationMyAccount?random=" + Math.floor(Math.random() * 10001)); }

                    if ($("#hdnStoreic").length > 0) { _store = $("#hdnStoreic").val(); }
                    else if ($("#hdnStoreic1").length > 0) { _store = $("#hdnStoreic1").val(); }
                    else { _store = "1"; }
                    if (_store == 0) { if ($('#btn_' + id + '').length > 0) { $('#btn_' + id + '').text("In Cart"); } }
                    else { $("#btn_" + id + "").text("In Cart"); }
                }
                else { alert("Item was not added to your cart. Please try again later.") }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
            // error: function (xhr, ajaxOptions, thrownError) { }
        });
    }
    // return false;
}

// below function is used to delete all the item from  shoping cart along with shoping cart.
function RemoveItemFrommShopCartNew() {
    //debugger;//To remove all the items 
    var ItemIds = null;
    if (confirm('Do you want to remove all items from shopping cart?')) {
        // ******Collecting the items  to deleet 
        var i = 0;
        var ImageIds = [];
        $("a[id^=linkRemoveItem_]").each(function () {
            // debugger;
            // var ImageIds = [];
            if (ItemIds == null) {
                //ItemIds = $('"#linkRemoveItem_' + i + '"').attr("customShoppingCartItemsId");
                ItemIds = $("#linkRemoveItem_" + i).attr("customShoppingCartItemsId");
            }
            else {
                //ItemIds = ItemIds + ',' + $('"#linkRemoveItem_' + i + ']"').attr("customShoppingCartItemsId");
                ItemIds = ItemIds + ',' + $("#linkRemoveItem_" + i).attr("customShoppingCartItemsId");
            }
            ImageIds[i] = $("#linkRemoveItem_" + i).attr("customShoppingCartItemsValue");
            i++;
        });
        // end  of code  for getting items  ids need to be deleted
        //  deleting the functionality 
        if (ItemIds != '' && ItemIds != 'undefined') {
            $(document).ready(function () {
                // debugger;
                $('#DivResult').load('http://' + DomainName + '/ShoppingCart/CartRemoveItems?RemoveItem=' + ItemIds + '&Flag=CleanCart' + '&random' + Math.floor(Math.random() * 10001));// removeing item

                // below is  moved to function named : RefreshParentPage() i.e on close button of pop up. .. in this case  pop up automatically closed & model refreshed..close button click is not required.So  commenting this code. 
                // if ($("#divShoppingCart").length > 0) { $('#divShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCart?random" + Math.floor(Math.random() * 10001)); } // updating item Price & total in model.
                //if ($("#divShoppingCartNav").length > 0) { $('#divShoppingCartNav').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random" + Math.floor(Math.random() * 10001)); }
                //if ($(".ulHeaderShoppingCart").length > 0) { $('.ulHeaderShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random=" + Math.floor(Math.random() * 10001)); }
                //if ($(".divMyAccountShoppingCart").length > 0) { $('.divMyAccountShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigationMyAccount?random=" + Math.floor(Math.random() * 10001)); }

                //Added By Rachna singh on 28/Aug-2013 to change value 'InCart' to 'AddToCart' w.r.t task #201
                $.each(ImageIds, function (key, value) {
                    if ($('#btn_' + value + '').length > 0) {
                        $('#btn_' + value + '').attr('class', 'cart store');
                        $('#btn_' + value + '').attr("href", "javascript:addtoCart(" + value + ");");
                        $("#btn_" + value + "").text("add to cart");
                    }
                    if ($("#btn_store_" + value + "").length > 0) { $('#btn_store_' + value + '').attr("href", "javascript:addtoCart(" + value + ");"); }
                    if ($("#ds_" + value + "").length > 0) { $('#ds_' + value + '').attr('class', ''); }
                })
                //Till Here
                $('div.btnClose').click();  //Added By Rachna singh on 27/Aug-2013 to close popup after update on ClearCart w.r.t task #198
            });
        }
    }
}

function UpdateShoppingCartNav() {
    //debugger;
    if ($("#divShoppingCartNav").length > 0) { $('#divShoppingCartNav').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random" + Math.floor(Math.random() * 10001)); }
    if ($(".ulHeaderShoppingCart").length > 0) { $('.ulHeaderShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigation?random=" + Math.floor(Math.random() * 10001)); }
    if ($(".divMyAccountShoppingCart").length > 0) { $('.divMyAccountShoppingCart').load("http://" + DomainName + "/ShoppingCart/ShoppingCartNavigationMyAccount?random=" + Math.floor(Math.random() * 10001)); }
}
////************************************************************************************************

function ExceptionHandling(ex, message, messagetype) {
    var exceptiontype = null;
    var DisplayMessage = '';
    if ($(ex).find('#ExceptionTypeValue').length > 0) {
        exceptiontype = $(ex).find('#ExceptionTypeValue');
        DisplayMessage = $(ex).html();
    }
    else {
        exceptiontype = $(ex.responseText).find('#ExceptionTypeValue');
        DisplayMessage = $(ex.responseText).html();
    }
    if (exceptiontype.val() == ExceptionEnum.LogoutWithAjaxRequest) {
        // window.location = "http://" + DomainName + "/login/logout";
        window.location.href = "http://" + DomainName + "/login/logout";
    }
    else if (exceptiontype.val() == ExceptionEnum.Exception) {
        if (message != undefined && message != '') {
            DisplayMessage = '<div class="alert alert-error" ><button data-dismiss="alert" class="close" type="button">×</button>' + message + '</div>';
        }
        ShowMessage(DisplayMessage, false);
    }
}
var ExceptionEnum = {
    Exception: 0,
    LogoutWithAjaxRequest: 1
};
function ShowMessage(message, messagetype) {
    if (messagetype == 'true') {
        message = '<div class="alert alert-success" ><button data-dismiss="alert" class="close" type="button">×</button>' + message + '</div>';
    }
    if ($("#DivErrorMessage").length > 0) {
        $("#DivErrorMessage").html(message);
    }
    else {
        $("#divMasterErrorMessage").html(message);
    }
}

/*--------------------------- Debasis on 10th July 2013 --------------------------------*/
function setpiniterest() {
    /*--------------- JavaScript to get social buttons -----------------------*/
    if ($('#pinterestcontrol').length > 0) {
        (function (d) {
            var f = d.getElementsByTagName('SCRIPT')[0], p = d.createElement('SCRIPT');
            p.type = 'text/javascript';
            p.async = true;
            p.src = '//assets.pinterest.com/js/pinit.js';
            f.parentNode.insertBefore(p, f);
        }(document));
        setTimeout(function () { $("#divpinitbox").attr("style", "display:block;") }, 30000);
    }
}
/*--------------------------- End --------------------------------*/
//Description:Used to encode text
//Author:Vishant Garg
//CreatedOn:8/14/2013
//To decode HTML
function decodeText(TextToDcode) {
    try {
        return TextToDcode
             .replace(/&gt;/g, ">")
             .replace(/&lt;/g, "<")
             .replace(/%3F/g, "?")
             .replace(/%20/g, " ")
             .replace(/%3D/g, "=")
             .replace(/%26/g, "&")
             .replace(/%40/g, "@")
             .replace(/%2B/g, "+")
             .replace(/%26/g, "&")
             .replace(/%2C/g, ",")
             .replace(/&amp;/g, "&")
             .replace(/%5E/g, "^")
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/%20/g, ' ')
             .replace(/%23/g, '#')
             .replace(/%5B/g, '[')
             .replace(/%5D/g, ']')
             .replace(/%2c/g, ",")
             .replace(/%28/g, "(")
             .replace(/%29/g, ")")
             .replace(/%2F/g, "/")
             .replace(/&#039/g, "'")
             .replace(/%2f/g, "/")
             .replace(/%3a/g, ":")
             .replace(/%27/g, "'")
             .replace(/&#39;/g, "'")
             .replace(/&#92;/g, "\\");
    }
    catch (ex) {
        ExceptionHandling(ex);
    }
}
//Description:Used to encode text
//Author:Vishant Garg
//CreatedOn:8/14/2013
//To decode HTML
function EncodeText(TextToDcode) {
    try {
        return TextToDcode
             .replace(/#/g, '%23')
             .replace(/&/g, "&amp;")
             .replace(/>/g, "&gt;")
             .replace(/</g, "&lt;")
             .replace(/\\/g, "&92;")
             .replace(/\?/g, "%3F")
             .replace(/ /g, "%20")
             .replace(/=/g, "%3D")
            // .replace(/&/g, "%26")
             .replace(/@/g, "%40")
             .replace(/\+/g, "%2B")
             //.replace(/&/g, "%26")
             .replace(/,/g, "%2C")

             .replace(/\^/g, "%5E")
            // .replace(/&/g, '&amp;')
            // .replace(/</g, '&lt;')
            // .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/ /g, '%20')

             .replace(/\[/g, '%5B')
             .replace(/]/g, '%5D')
             .replace(/,/g, "%2c")
             .replace(/\(/g, "%28")
             .replace(/\)/g, "%29")
             .replace(/\//g, "%2F")
             .replace(/'/g, "&039")
             .replace(/\//g, "%2f")
             .replace(/:/g, "%3a")
             .replace(/'/g, "%27")
             .replace(/'/g, "&39;")
    }
    catch (ex) {
        ExceptionHandling(ex);
    }
}

//Added by Mamta Gupta - To handle exception from whole application
//function ExceptionHandling(ex) {
//    debugger;
//    var exceptiontype = $(ex.responseText).find('#ExceptionTypeValue');
//    if (exceptiontype.val() == ExceptionEnum.LogoutWithAjaxRequest) {
//        window.location = "http://" + DomainName + "/login/logout";
//    }
//    else if (exceptiontype.val() == ExceptionEnum.CustomMessage) {
//        if ($("#DivErrorMessage").length > 0) {
//            $("#DivErrorMessage").html($(ex.responseText).html());
//        }
//        else {
//            $("#divMasterErrorMessage").html($(ex.responseText).html());
//        }
//    }
//}
//var ExceptionEnum = {
//    CustomMessage: 0,
//    LogoutWithAjaxRequest: 1,
//    LogoutWithoutAjaxRequest: 2,
//    ExceptionWithAjaxRequest: 3,
//    ExceptionWithoutAjaxRequest: 4
//};


//Added By Vishant Garg
//With ref task #187 on 9/4/2013
function ChangeViewerPreferences(obj, val) {
    var href = obj;
    if (href != null && href != undefined && $.trim(href) != "") {
        if (href == top.location.href) {
            changeLoginViewer(val);
        }
        else {
            window.parent.top.location.href = href;
        }
    }
}
/*====================Added by Debasis Check Enabled Cookie 23/09/2013========*/
function CheckCookies_enabled() {
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;
    if (typeof navigator.cookieEnabled == "undefined" || !cookieEnabled) {
        var URL = "http://" + DomainName + "/common/GetSessionUserRequestInfo";
        $.ajax({
            cache: false,
            type: "GET",
            url: URL,
            data: {},
            success: function (data) {
                if (data != null && data == "failed") {
                    window.location.href = "http://" + DomainName + "/common/CookieEnablePopup";
                }
            },
            error: function (ex) {
                ExceptionHandling(ex);
            }
        });
    }
}
// A jQuery based placeholder polyfill-- Done by Rakesh/V related to water mark/ Place holder in IE 9.0 and IE 10.0
$(document).ready(function () {
    if (window.navigator.appName = 'Microsoft Internet Explorer') {
        function add() {
            if ($(this).val() === '') {
                $(this).val($(this).attr('placeholder')).addClass('placeholder');
            }
        }
        function remove() {
            if ($(this).val() === $(this).attr('placeholder')) {
                $(this).val('').removeClass('placeholder');
            }
        }
        // Create a dummy element for feature detection
        if (!('placeholder' in $('<input>')[0])) {
            // Select the elements that have a placeholder attribute
            $('input[placeholder], textarea[placeholder]').blur(add).focus(remove).each(add);
            // Remove the placeholder text before the form is submitted
            $('form').submit(function () {
                $(this).find('input[placeholder], textarea[placeholder]').each(remove);
            });
        }
    }
});