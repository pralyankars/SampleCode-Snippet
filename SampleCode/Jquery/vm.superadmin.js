c4u.vm.superadmin = c4u.vm.superadmin || {};

$(function () {
    $('#_selectcodetype').on('change', function () {
        switch ($(this).val()) {
            case '1': {
                $('#_partnercode').show();
                $('#_salescode').hide();
                $('#_labelcode').show();
            }
                break;
            case '2':
                {
                    $('#_salescode').show();
                    $('#_partnercode').hide();
                    $('#_labelcode').show();
                }
                break;
            default:
                {
                    $('#_labelcode,#_salescode,#_partnercode').hide();
                }
        }
    });
    var CodeType = function (name, id) {
        this.TypeName = name;
        this.TypeId = id;
    };
    var ChangeCode = function (userId, partnerCode, salesCode, codeType) {
        return {
            userId: ko.observable(userId),
            codeType: ko.observable(codeType).extend({
                required: true
            }),
            CodeTypes: ko.observableArray([
                                    new CodeType("Partner", '1'),
                                    new CodeType("Sales", '2')
            ]),
            partnerCode: ko.observable(partnerCode).extend({
                maxLength: 3
            }),
            salesCode: ko.observable(salesCode).extend({
                maxLength: 3
            }),
            isValid: function () {
                ko.validation.group(this);
                return this.errors().length == 0;
            }
        };
    }
    var SuperAdminVM = function () {
        var
            self = this,
            submitted = false,
            _tableSelector = "#all-users-list",
             _tableAccountSelector = "#all-account-list",
            _table = null,
            _tableAccount = null,
        _changeCode = new ChangeCode(),
       _openPopupWindow = function (item) {
           $('#_selectcodetype').val('').trigger('change');
           _changeCode.partnerCode(item.PartnerCode);
           _changeCode.salesCode(item.SalesCode);
           _changeCode.codeType();
           _changeCode.userId(item.UserId);
           _changeCode.isValid();
           _changeCode.errors.showAllMessages(false);
       },
        _changePartnerCode = function () {

            var valid = true;
            $.ajax({
                async: false,
                url: pageResolveURL + "/Admin/Dashboard/CheckUniqueCode",
                data: {
                    code: ($('#_selectcodetype').val() == '1') ? $('#_partnercode').val() : $('#_salescode').val(),
                    type: $('#_selectcodetype').val()
                },
                success: function (data) {
                    valid = data;
                }
            });
            if (!valid) {
                c4u.alerts.error("Following code already exists in the system");
                return false;
            }
            $.post(pageResolveURL + "/Admin/Dashboard/ChangeCode", {
                id: _changeCode.userId(),
                partnerCode: _changeCode.partnerCode(),
                //<PRASHANT>>
                salesCode: _changeCode.salesCode(),
                codeType: _changeCode.codeType()
            }, function (result) {
                if (result.success) {
                    _refreshDatatable();
                    c4u.alerts.success(c4u.msg.GlobalcodeSaveSuccess);
                    submitted = false;
                    $('#change-code-modal').modal('hide');
                }
                else {
                    c4u.alerts.error(result.messgae);
                    submitted = false;
                }
            });
        },

        _getData = function (options, callback) {
            $.ajax({
                url: pageResolveURL + "/Admin/Dashboard/GetData",
                data: ko.toJSON(options),
                type: "POST",
                contentType: "application/json charset=utf-8",
                dataType: "json",
                success: function (response, textStatus, jqXHR) {
                    callback(response.data);
                }
            });

        },
          _getAccountData = function (options, callback) {

              $.ajax({
                  url: pageResolveURL + "/Admin/Dashboard/GetAccountData",
                  data: ko.toJSON(options),
                  type: "POST",
                  contentType: "application/json charset=utf-8",
                  dataType: "json",
                  success: function (response, textStatus, jqXHR) {
                      callback(response.data);
                  }
              });

          },
           _inviteUser = function (item) {
               $.post(pageResolveURL + "/Settings/Users/InviteUser", { id: item.UserId }, function (result) {
                   if (result.success) {
                       _refreshDatatable();
                       c4u.alerts.success(result.Message);
                   }
                   else {
                       c4u.alerts.error(result.Message);
                   }
               });
           },
            _deleteUser = function (item) {
                if (confirm("Are you sure want to delete?")) {
                    $.post(pageResolveURL + "/Settings/Users/DeleteUser", { id: item.UserId }, function (result) {
                        if (result.success) {
                            _refreshDatatable();
                            c4u.alerts.success(c4u.msg.userDeleteSuccess);
                        }
                        else {
                            c4u.alerts.error(c4u.msg.userDeleteError);
                        }
                    });
                }
            },
            _deleteAccount = function (item) {

                if (confirm("Are you sure want to delete?")) {

                    $.post(pageResolveURL + "/Admin/Dashboard/DeleteAccount", { Id: item.Id }, function (result) {
                        if (result.success) {
                            _refreshAccountDatatable();
                            c4u.alerts.success(c4u.msg.companyDeleteSuccess);
                        }
                        else {

                            if (result.messgae == undefined) {
                                c4u.alerts.error(c4u.msg.companyDeleteError);
                            }
                            else {
                                c4u.alerts.error(result.messgae);
                            }

                        }
                    });
                }
            },
        _isValid = function () {
            _changeCode.errors.showAllMessages(true);
            return _changeCode.isValid();
        },
        _submitChangePartnerCode = function (modalWindowId) {
            if (_isValid() == true) {
                _submitForm();
            }
        },
        _submitForm = function () {
            _changePartnerCode();
        },

        _refreshDatatable = function () {
            _table.fnDraw();
        },
       _refreshAccountDatatable = function () {
           _tableAccount.fnDraw();
       },
        _init = function () {

        },

        _afterInit = function () {
            _table = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableSelector)[0]);
            _tableAccount = ko.bindingHandlers.dataTable.getDataTableInstance($(_tableAccountSelector)[0]);
        };
        _init();
        return {
            changeCode: _changeCode,
            getData: _getData,
            openPopupWindow: _openPopupWindow,
            submitChangePartnerCode: _submitChangePartnerCode,
            getAccountData: _getAccountData,
            inviteUser: _inviteUser,
            deleteUser: _deleteUser,
            deleteAccount: _deleteAccount,
            afterInit: _afterInit
        };
    }

    c4u.vm.superadmin = new SuperAdminVM();

    ko.applyBindings(c4u.vm.superadmin, $(c4u.config.selectors.bindingContainer).get(0));

    c4u.vm.superadmin.afterInit();
});

