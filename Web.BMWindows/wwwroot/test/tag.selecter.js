////// READ ME
//
// can ke thua thu vien select2
//////
(function ($) {
    $.fn.tagSelector = function (options) {
        var s = this;
        var selector = this.selector;
        s.selectedData = [];
        s.count = 0;
        var select2 = $(selector).find('.selector');
        var settings = $.extend({
            editUrl: null,
            dataUrl: null,
            addTagData: null
        }, options);
        s.events = function () {
            var url = settings.editUrl != null ? settings.editUrl : '/admin/tagEdit';
            $(selector).find('#add_tag_btn').unbind().click(function () {
                console.log('Button thêm tags đã được click: ', url);
                var tf = $(selector).find('.create-form');
                $(tf).show();
                $(tf).find('button').unbind().click(function () {
                    console.log(123);
                    if (hasValue($(tf).find('input').val())) {

                        var data = {
                            namevn: $(tf).find('input[name="t_vn"]').val(),
                            nameen: $(tf).find('input[name="t_en"]').val()
                        };
                        if (settings.addTagData != null) {
                            data = $.extend(data, settings.addTagData);
                        }
                        $.ajax({
                            type: 'POST',
                            url: url,
                            data: data,
                            success: function (result) {
                                if (result != null) {
                                    s.selectedData.push({ id: result.Id, text: result.NameVn });
                                    select2.select2('destroy');
                                    select2.append('<option selected="selected" value="' + result.Id + '">' + result.NameVn + '</option>');
                                    s.initSelect();
                                }
                                $(tf).hide();
                                $(tf).find('input').val('');
                            }
                        });
                    } else {
                        $(selector).find('p').text('Nhập tên tag');
                    }
                });
            });
        };
        s.init = function () {
            var tags = $(selector).find('input[type="hidden"]').val();
            console.log(tags);
            if (hasValue(tags)) {
                s.selectedData = $.parseJSON(tags);
            } 
           
            s.initSelect();
            s.events();
        };
        s.initSelect = function () {
            console.log(444);
            var url = settings.dataUrl != null ? settings.dataUrl : "/admin/tagList";
            console.log(url);
            select2.unbind().select2({
                ajax: {
                    url: url,
                    dataType: 'json',
                    delay: 150,
                    data: function (params) {
                        console.log(params);
                        return {
                            keyword: params, // search term
                            page: params.page,
                            limit: 5
                        };
                    },
                    processResults: function (result, params) {
                        var data = [];
                        if (result.Many.length > 0) {
                            $(result.Many).each(function () {
                                data.push({ id: this.Id, text: this.NameVn });
                            });
                        }
                        params.page = params.page || 1;
                        return {
                            results: data,
                            pagination: {
                                more: (params.page * 30) < 0
                            }
                        };
                    }
                },
                minimumInputLength: 1,
                multiple: true
                //initSelection: function (element, callback) {
                //    callback(s.selectedData);
                //}
            }).on("change", function (e) {
                if (e.added != null) {
                    s.selectedData.push(e.added);
                }
                if (e.removed != null) {
                    for (var i = 0; i < s.selectedData.length; i++) {
                        if (s.selectedData[i].id == e.removed.id) {
                            s.selectedData.splice(i, 1);
                        }
                    } 
                }
            });

            var data = [];
            $(s.selectedData).each(function () {
                var name = app.hasValue(this.text_vn) ? this.text_vn : this.text;
                data.push({
                    id: this.id,
                    text: name
                }) 

            });
            select2.select2('data', data)
        }
        s.init();
        return s;
    }

}(jQuery));

////fix modal force focus
//$.fn.modal.Constructor.prototype.enforceFocus = function () {
//    var that = this;
//    $(document).on('focusin.modal', function (e) {
//        if ($(e.target).hasClass('select2-input')) {
//            return true;
//        }
//        if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
//            that.$element.focus();
//        }
//    });
//};