var _maxInt = 2100000000;
var icons = {
    'warning': 'pe-7s-info',
    'success': 'pe-7s-check',
    'error': 'fa fa-frown-o'
};
var vnChars = ['à', 'à', 'á', 'ạ', 'ả', 'ã', 'â', 'ầ', 'ấ', 'ậ', 'ẩ', 'ẫ', 'ă', 'ằ', 'ắ', 'ặ', 'ẳ', 'ẵ', 'è', 'é', 'ẹ', 'ẻ', 'ẽ', 'ê', 'ề', 'ế', 'ệ', 'ể', 'ễ', 'ì', 'í', 'ị', 'ỉ', 'ĩ', 'ò', 'ó', 'ọ', 'ỏ', 'õ', 'ô', 'ồ', 'ố', 'ộ', 'ổ', 'ỗ', 'ơ', 'ờ', 'ớ', 'ợ', 'ở', 'ỡ', 'ù', 'ú', 'ụ', 'ủ', 'ũ', 'ư', 'ừ', 'ứ', 'ự', 'ử', 'ữ', 'ỳ', 'ý', 'ỵ', 'ỷ', 'ỹ', 'đ'];

(function ($) {
    $.fn.btnSelect = function (options) {
        var s = this;
        s.selector = this.selector;
        s.setting = $.extend({
            onSelect: null
        }, options);
        $(s.selector).find('.dropdown-menu a').click(function () {
            $(s.selector).find('.btn span').text($(this).text());
            if (s.setting.onSelect != null) {
                s.setting.onSelect($(this).attr('dataid'));
            }
        });
        s.init = function () {

        }
        s.init();
        return s;
    }
}(jQuery));

var daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

var newGuid = function (length) {
    var text = "";
    if (length == null) {
        length = 10;
    }
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
},
    convertIsoDateToJsDate = function (value, lang, hasTime) {
        if (typeof value === 'string') {
            var a =
                /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([\+-])(\d{2})\:(\d{2}))?Z?$/.exec(value);
            if (a) {
                var utcMilliseconds = Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]);
                var date = new Date(utcMilliseconds);
                var month = (date.getMonth() + 1);
                if (month < 10) {
                    month = '0' + month;
                }
                lang = lang != null ? lang : 'vn';
                var str = '';
                if (lang == 'vn') {
                    str = date.getDate() + '/' + month + '/' + date.getFullYear();
                } else {
                    str = month + '/' + date.getDate() + '/' + date.getFullYear();
                }
                if (hasTime) {
                    var hours = date.getHours();
                    var minutes = date.getMinutes();

                    if (minutes < 10)
                        minutes = '0' + minutes;
                    str += ' ' + hours + ":" + minutes + " ";
                }
                return str;
            }
        }
        return value;
    },
    convertCToJsDate = function (value, lang, hasTime) {
        if (!app.hasValue(value))
            return '';
        var date = new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
        var month = (date.getMonth() + 1);
        if (month < 10) {
            month = '0' + month;
        }
        lang = lang != null ? lang : 'vn';
        var str = '';
        if (lang == 'vn') {
            str = date.getDate() + '/' + month + '/' + date.getFullYear();
        } else {
            str = month + '/' + date.getDate() + '/' + date.getFullYear();
        }
        if (hasTime) {
            var hours = date.getHours();
            var minutes = date.getMinutes();

            if (minutes < 10)
                minutes = '0' + minutes;
            str += ' ' + hours + ":" + minutes + " ";
        }
        return str;
    },
    update_async_data = function (obj) {

        //var a = {
        //    url: '',
        //    count: [],
        //    data: {},
        //    callback: function() { 
        //    } 
        //};

        var index = 0;
        var html =
            '<div class="modal fade update-async-modal" data-backdrop="static"  role="dialog" aria-labelledby="mySmallModalLabel" >' +
            '<div class="modal-dialog modal-sm" role="document"><div class="modal-content"><div class="media no-margin stack-media-on-mobile">' +
            '<div class="media-left media-middle"><div class="process-circle">' +
            '<svg class="progress-ring" width="60" height="60"><circle class="progress-ring__circle" stroke="#2196F3" stroke-width="3" fill="transparent" r="27" cx="30" cy="30"/></svg>' +
            '<span class="progress-percent" >0%</span></div></div><div class="media-body pr-10 pt-15"><h6 class="media-heading text-bold">' +
            obj.text +
            '</h6> ' +
            '</div></div></div></div></div>';
        $('body').append(html);

        var m = '.update-async-modal';
        var circle, radius, circumference, percent;
        circle = document.querySelector(m + ' circle');
        radius = circle.r.baseVal.value;
        circumference = radius * 2 * Math.PI;
        $(m).modal('show');
        var posting = false;
        var interval = setInterval(function () {
            if (index < obj.count.length) {
                if (!posting) {
                    posting = true;
                    var data = $.extend(obj.data, obj.count[index]);
                    app.postData(obj.url,
                        data,
                        function (result) {
                            posting = false;
                            index++;
                            percent = Math.floor(index / obj.count.length * 100);
                            var offset = circumference - percent / 100 * circumference;
                            circle.style.strokeDashoffset = percent != 100 ? offset : 0;
                            $(m + ' .progress-percent').text(percent + '%');
                        });
                }
            } else {
                clearInterval(interval);
                $(m).modal('hide');
                obj.callback();
            }
        },
            100);
    },
    confirm_khong_duyet = function (url, data, callback) {
        var guid = app.newGuid(10);
        swal({
            title: "Không đồng ý duyệt",
            text: '<p>Anh/Chị vui lòng cho biết lý do không đồng ý duyệt</p>' +
                '<textarea id="confirm_' +
                guid +
                '" class="form-control" placeHolder="Lý do không đồng ý duyệt"></textarea>',
            html: true,
            showCancelButton: true,
            closeOnConfirm: false,
            confirmButtonColor: "#ff5722",
            cancelButtonText: "Để sau",
            confirmButtonText: "Hoàn tất",
            showLoaderOnConfirm: true,
            focusConfirm: true
        },
            function (isConfirm) {
                if (!isConfirm) return;

                var cause = $('#confirm_' + guid).val();
                if (cause === "") {
                    swal.showInputError("Anh/Chị vui lòng nhập lý do không đồng ý duyệt !");
                    return false;
                }
                data.lyDoKhongDuyet = cause;
                app.postData(url,
                    data,
                    function (result) {
                        if (result.Success) {
                            swal({
                                title: "Thao tác thành công",
                                type: 'success'
                            },
                                function () {
                                    if (callback != null) {
                                        callback(true);
                                    }
                                });
                        } else {
                            swal(result.Message, '', "error");

                            if (callback != null) {
                                callback(false);
                            }
                        }
                    });
            });
    },
    confirm_duyet = function (url, data, callback) {
        var guid = app.newGuid(10);
        swal({
            title: "Đồng ý duyệt",
            text: '<p>Nhập ý kiến của Anh/Chị (nếu có)</p><textarea id="confirm_' +
                guid +
                '" class="form-control" placeHolder="Nhập ý kiến của Anh/Chị (nếu có)"></textarea>',
            html: true,
            showCancelButton: true,
            closeOnConfirm: false,
            confirmButtonColor: "#009688",
            cancelButtonText: "Để sau",
            confirmButtonText: "Duyệt",
            showLoaderOnConfirm: true,
            focusConfirm: true
        },
            function (isConfirm) {
                if (!isConfirm) return;

                var yk = $('#confirm_' + guid).val();
                data.yKien = yk;

                app.postData(url,
                    data,
                    function (result) {
                        if (result.Success) {
                            swal({
                                title: "Duyệt thành công",
                                type: 'success'
                            },
                                function () {
                                    if (callback != null) {
                                        callback(true);
                                    }
                                });
                        } else {
                            swal(result.Message, '', "error");
                            if (callback != null) {
                                callback(false);
                            }
                        }
                    });
            });
    },
    app_confirm = function (type, title, text, callback) {
        var option = {
            title: "Anh/Chị có chắc chắn?",
            type: type,
            closeOnConfirm: true
        };
        switch (type) {
            case 'success':
                {

                }
                break;
            case 'warning':
                {
                    option.showCancelButton = true;
                    option.confirmButtonColor = "#4caf50";
                    option.confirmButtonText = "Đồng ý";
                    option.cancelButtonText = "Để sau";
                }
                break;
            case 'error':
                {

                }
                break;
        }
        if (title != null) {
            option.title = title;
        }
        if (text != null) {
            option.text = text;
        }
        swal(option, callback);
    },
    app_confirm_ajax = function (opt) {
        var text = opt.text != null ? opt.text : null;
        var html = opt.html != null ? opt.html : null;
        var title = opt.title != null ? opt.title : 'Anh/Chị có chắc chắn ?';
        var cbt = opt.confirmButtonText != null ? opt.confirmButtonText : 'Đồng ý';
        swal({
            title: title,
            text: text,
            html: true,
            showCancelButton: true,
            closeOnConfirm: false,
            confirmButtonColor: "#4caf50",
            cancelButtonText: "Để sau",
            confirmButtonText: cbt,
            showLoaderOnConfirm: true
        },
            function (ok) {
                if (!ok) return;
                app.postData(opt.url,
                    opt.data,
                    function (result) {
                        if (result.Success) {
                            swal({
                                title: "Thao tác thành công",
                                type: 'success'
                            },
                                function () {
                                    if (opt.callback != null) {
                                        opt.callback(result);
                                    }
                                });
                        } else {
                            swal(result.Message, '', "error");
                            if (opt.callback != null) {
                                opt.callback(result);
                            }
                        }
                    });
            });
    },

    val = function (obj, attr) {
        if (obj != null)
            return obj[attr];
        return '';
    },
    cleanJson = function (obj) {
        for (var propName in obj) {
            if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
                delete obj[propName];
            }
        }
    },
    toAid = function (id, c, len) {
        if (len == null) {
            len = 7;
        }
        var z = len - (id + '').length;
        for (var i = 0; i < z; i++) {
            c += '0';
        }
        return c + id;
    },
    convertVnToEnDate = function (d) {
        if (d != null && d != '') {
            var arr = d.split('/');
            if (arr.length >= 3) {
                if (typeof VNFormatDate != 'undefined') {
                    if (VNFormatDate) {
                        return arr[0] + '/' + arr[1] + '/' + arr[2];
                    }
                }
                return arr[1] + '/' + arr[0] + '/' + arr[2];
            }
        }
        return '';
    },
    convertVnToEnDateTime = function (d) {
        if (d != null && d != '') {
            var m = moment(d, "DD/MM/YYYY HH:mm");
            if (typeof VNFormatDate != 'undefined') {
                if (VNFormatDate) {
                    return m.format("DD/MM/YYYY HH:mm");
                }
            }
            return m.format("MM/DD/YYYY HH:mm");
        }
        return '';
    },
    app_alert = function (type, message) {
        var a = '<div class="alert alert-' +
            type +
            ' fade in" role="alert">' +
            '<button class="close" type="button" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>';
        a += message + '</div>';
        return a;
    },
    toKeyword = function (str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|`|-|{|}|\||\\/g,
            " ");
        str = str.replace(/ + /g, " ");
        str = str.trim();

        str = str.replace(/[^a-z0-9_\s]/gi, '');
        return str;
    },
    emailValid = function (val) {
        var emailPattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
        return emailPattern.test(val);
    },
    replaceBrToNewLine = function (str) {
        if (str != null && str != '') {
            str = str.replace(new RegExp('<br/>', 'g'), '\n');
            str = str.replace(new RegExp('<br />', 'g'), '\n');
            return str;
        }
        return '';
    },
    replaceNewLineToBr = function (str) {
        return str.replace(new RegExp('\n', 'g'), '<br/>');
    },
    app_notify = function (type, message, br) {
        var opts = {
            text: message,
            addclass: 'bg-' + type
        };

        if (br) {
            opts.addclass += ' stack-bottom-right';
            opts.stack = { "dir1": "left", "dir2": "up", "firstpos1": 20, "firstpos2": 20 };
        }

        new PNotify(opts);
    },
    setLoading = function (hide) {
        var str = '<div class="loading" style="' + (hide ? 'display: none' : '') + '" ><div><div class="sk-chase">';
        for (var i = 0; i < 6; i++) {
            str += '<div class="sk-chase-dot"></div>';
        }
        str += '</div></div></div>';
        return str;
    },



    formDataToJson = function (formData) {
        var object = {};
        formData.forEach(function (value, key) {
            object[key] = value;
        });
        return object;
    },
    formatJsDate = function (value) {
        if (!app.hasValue(value))
            return '';
        var date = new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
        return date;
    },
    formatDate = function (value, lang) {
        if (!app.hasValue(value))
            return '';

        var d = moment(value);

        lang = lang != null ? lang : 'vn';
        if (lang == 'vn') {
            return d.format('DD/MM/YYYY');
        }
        return d.format('MM/DD/YYYY');
    },
    formatDateTime = function (value, lang) {
        if (!app.hasValue(value))
            return '';
        var date = new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
        var month = (date.getMonth() + 1);
        if (month < 10) {
            month = '0' + month;
        }
        var hours = date.getHours();
        var minutes = date.getMinutes();

        if (minutes < 10)
            minutes = '0' + minutes;

        lang = lang != null ? lang : 'vn';
        if (lang == 'vn') {
            return date.getDate() + '/' + month + '/' + date.getFullYear() + " " + hours + ":" + minutes + " ";
        }
        return month + '/' + date.getDate() + '/' + date.getFullYear() + " " + hours + ":" + minutes + " ";
    },
    formatTime = function (value) {
        var hours = value.Hours;
        if (hours < 10) {
            hours = '0' + hours;
        }
        var minutes = value.Minutes;
        if (minutes < 10)
            minutes = '0' + minutes;

        return hours + ":" + minutes + " ";
    },
    formatBeatyDateTime = function () {
        $('.beaty-datetime').each(function () {
            var t = $(this);
            if (!t.hasClass('formated')) {
                var data = t.attr('data');
                t.text(beatyTime(data));
                t.addClass('formated');
            }
        });
    },
    rateRender = function () {
        $('.rate-render').each(function () {
            if (!$(this).hasClass('rendered')) {
                var r = $(this).attr('data');
                var t = $(this).attr('data-total');
                var empty = 5 - r;
                var h = '';
                for (var i = 0; i < r; i++) {
                    h += '<i class="icon-star-full2 text-orange-400 text-size-base"></i>';
                }
                for (var i = 0; i < empty; i++) {
                    h += '<i class="icon-star-full2 text-muted text-size-base"></i>';
                }
                if (t != null) {
                    h += '<span class="text-muted position-right">(' + t + ')</span>';
                }
                $(this).html(h);
                $(this).addClass('rendered');
            }

        });
    },
    loadData = function (url, params, page, callback) {
        var dt = params.dataType != null ? params.dataType.toLowerCase() : 'json';
        if (page != null) {
            $.extend(params,
                {
                    page: page
                });
        }
        var options = {
            url: url,
            data: params,
            type: "GET",
            dataType: dt,
            success: function (result) {
                if (dt == 'json' && hasValue(result.SessionExpired) && result.SessionExpired) {
                    $('#login_modal').modal('show');
                } else if (dt == 'html' && result.indexOf("SessionExpired") >= 0) {
                    $('#login_modal').modal('show');
                } else {
                    callback(result);
                }
            }
        };

        //if (params.headers != null) {
        //    options.headers = params.headers;
        //    params.headers = null;
        //}
        if (params.cache) {
            options.cache = true;
        }
        if (params.async == false) {
            options.async = false;
        }
        return $.ajax(options);
    },
    lazyLoader = function (calback) {
        $(".lazy").Lazy({
            effect: 'fadeIn',
            beforeLoad: function (element) {
            },
            afterLoad: function (element) {
                $(element).addClass('loaded');
                if (calback != null) {
                    calback(element);
                }
            },
            onError: function (element) {
            },
            onFinishedAll: function () {
            }
        });
    },
    postData = function (url, params, callback, forForm) {
        var options = {
            url: url,
            data: params,
            type: "POST",
            dataType: params.dataType != null ? params.dataType : 'JSON',
            success: function (result) {
                if (hasValue(result.SessionExpired) && result.SessionExpired) {
                    $('#login_modal').modal('show');
                } else {
                    callback(result);
                }
            }
        }
        if (params.async == false) {
            options.async = false;
        }
        if (forForm) {
            options.processData = false;
            options.contentType = false;
        }
        $.ajax(options);
    },
    hasValue = function (obj) {
        return typeof obj != 'undefined' && obj != '' && obj != null;
    },
    convertNiceStrToObject = function (str) {
        var objs = [];
        if (str != null && str != '') {
            var arr = str.split('|');
            $(arr).each(function () {
                if (this != '') {
                    var a = this.split(';');
                    objs.push({
                        id: a[0],
                        text: a[1]
                    });
                }
            });
        }
        return objs;
    },
    d100 = function (str) {
        str = str + str;
        var d = [];
        for (var i = 0; i < str.length; i++) {
            var b = str[i].charCodeAt().toString(2);
            var b1 = Array(8 - b.length + 1).join("0") + b;
            b1 = (b1 + '').replace(/0/g, '2').replace(/1/g, '0').replace(/2/g, '1');
            var b2 = '';
            for (var j = 0; j < 8; j++) {
                if (b1[j] == '0') {
                    b2 += String.fromCharCode((Math.floor(Math.random() * 25) + 65));
                } else {
                    b2 += String.fromCharCode((Math.floor(Math.random() * 25) + 97));
                }
            }
            d.push(b2);
        }
        return d.join('');
    },
    _substr = function (str, len) {
        if (hasValue(str)) {
            if (str.length > len) {
                return str.substring(0, len) + '...';
            }
            return str;
        }
        return '';
    },
    idImage = function (type, media, id, thumbsize, name, companyId) {
        var p = '/media' + (media > 0 ? media : '');
        if (companyId != null) {
            p += '/company/' + companyId;
        }
        p += '/' + type + '/';
        var fname = name.indexOf('.jpg') >= 0 ? name : name + '.jpg';
        if (id > 100) {
            var i = 1;
            var idname = id + '';
            while (i < idname.length - 1) {
                p += idname.substring(0, i) + '/';
                i++;
            }
        }
        p += id + "/" + fname;
        if (hasValue(thumbsize)) {
            p += '.thumb/' + thumbsize + '.jpg';
        }
        return p;
    },
    guidImage = function (type, media, guid) {
        var p = '/media' + (media > 0 ? media : '');
        p += '/' + type + '/';
        var fname = name.indexOf('.jpg') >= 0 ? name : name + '.jpg';
        p += guid[0] + '/' + guid + fname;
        return p;
    },
    idFolder = function (path, id) {
        var p = '';
        if (id > 100) {
            var i = 1;
            var idname = id + '';
            while (i < idname.length - 1) {
                p += idname.substring(0, i) + '/';
                i++;
            }
        }
        p += path + id;
        return p;
    },
    dateImage = function (type, media, id, thumbsize, name) {
        var p = '/media' + (media > 0 ? media : '') + '/' + type + '/';
        var fname = name.indexOf('.jpg') >= 0 ? name : name + '.jpg';
        if (id > 100) {
            var i = 1;
            var idname = id + '';
            while (i < idname.length - 1) {
                p += idname.substring(0, i) + '/';
                i++;
            }
        }
        p += id + "/" + fname;
        if (hasValue(thumbsize)) {
            p += '.thumb/' + thumbsize + '.jpg';
        }
        return p;
    },
    thumb = function (type, fileName, size) {
        var extension;
        var path = '';
        if (fileName == '' || fileName == null) {
            if (size != null) {
                path = '/media/default/' + type + '/' + size + '.jpg';
            } else {
                path = '/media/default/' + type + '/xs.jpg';
            }

        } else if (type == '' || type == null) {
            if (size != null) {
                extension = fileName.substr(fileName.lastIndexOf('.'));
                path = fileName + ".thumb/" + size + extension;
            } else {
                path = fileName;
            }
        } else {
            if (type == 'videos') {
                extension = '.jpg';
            } else {
                extension = fileName.substr(fileName.lastIndexOf('.'));
            }

            if (size != null) {
                path = fileName + ".thumb/" + size + extension;
            } else {
                path = fileName;
            }
        }
        return path;
    },
    removeVnChars = function (str) {
        str = str.replace(/à|à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ.+/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ.+/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/đ/g, "d");
        return str;
    },
    has_vnChars = function (str) {
        for (var i = 0; i < str.length; i++) {
            if (vnChars.indexOf(str[i]) >= 0) {
                return true;
            }
        }
        return false;
    },
    beatyTime = function (dt) {
        var d1 = moment();
        var d2 = moment(dt);
        if (d1.diff(d2, 'years') > 0) {
            return Math.round(d1.diff(d2, 'years')) + ' năm trước';
        }
        if (d1.diff(d2, 'months') > 0) {
            return Math.round(d1.diff(d2, 'months')) + ' tháng trước';
        }
        if (d1.diff(d2, 'days') > 0) {
            return Math.round(d1.diff(d2, 'days')) + ' ngày trước';
        }
        if (d1.diff(d2, 'hours') > 0) {
            return Math.round(d1.diff(d2, 'hours')) + ' giờ trước';
        }
        if (d1.diff(d2, 'minutes') > 0) {
            return Math.round(d1.diff(d2, 'minutes')) + ' phút trước';
        }
        if (d1.diff(d2, 'minutes', true) > 0) {
            return 'Vừa xong';
        }
        if (d2.diff(d1, 'days') > 1) {
            return 'Còn ' + Math.round(d2.diff(d1, 'days')) + ' ngày nữa';
        }
        if (d2.diff(d1, 'days') == 1) {
            return 'ngày mai';
        }
        if (d2.diff(d1, 'hours') < 24 && d2.diff(d1, 'hours') > 0) {
            return 'Còn ' + Math.round(d2.diff(d1, 'hours')) + ' giờ nữa';
        }
        if (d2.diff(d1, 'minutes', true) < 60) {
            return 'Còn ' + Math.round(d2.diff(d1, 'minutes')) + ' phút nữa';
        }
        return '';
    },
    formatPrice = function (str) {
        if (str == null)
            return '';
        if (!hasValue(str) || str == 0) {
            return '0';
        }
        str = str + '';
        str = str.replace(/\n|\r/g, '') + "";
        if (str.indexOf('.') >= 0) {
            var arr = str.split(".");
            var sn = arr[0];
            while (sn.length > 1 && sn[0] == '0') {
                sn = sn.substr(1, sn.length - 1);
            }
            str = sn + '.' + arr[1];
        } else {
            while (str[0] == '0') {
                str = str.substr(1, str.length - 1);
            }
        }
        var oper = "";

        if (str[0] == '-' || str[0] == '+') {
            oper = str[0];
            str = str.substr(1);
        }
        var parts = (str + "").split("."),
            main = parts[0],
            len = main.length,
            output = "",
            i = len - 1;
        while (i >= 0) {
            output = main.charAt(i) + output;
            if ((len - i) % 3 === 0 && i > 0) {
                output = "," + output;
            }
            --i;
        }
        if (parts.length > 1) {
            output += "." + parts[1];
        }
        return oper + '' + output;
    },
    requestAuth = function (callback) {
        if ($('#user_role').length == 0) {
            var am = '#authModal';
            var myback = function () {
                $(am).modal('hide');
                loadData('/api/authPanel',
                    {
                        dataType: 'html'
                    },
                    null,
                    function (result) {
                        $('#auth_panel').html(result);
                        if (callback != null) {
                            callback(true);
                        }
                    });
            }
            var option = {
                loginCallback: myback,
                registCallback: myback,
                forgotCallback: myback
            };
            if ($(am + ' .form-content').html() == '') {
                loadData('/api/authForm',
                    {
                        dataType: 'html'
                    },
                    null,
                    function (result) {
                        $(am + ' .form-content').html(result);
                        $(am).modal('show');
                        initAuth(option);
                    });
            } else {
                $(am).modal('show');
                initAuth(option);
            }
            $(am + ' .close').unbind().click(function () {
                $(am).modal('hide');
                callback(false);
            });
        } else {
            if (callback != null) {
                callback(true);
            }
        }
    },
    roundToNearest = function (numToRound, numToRoundTo) {
        numToRoundTo = 1 / (numToRoundTo);
        return Math.round((numToRound - 1) * numToRoundTo) / numToRoundTo;
    },
    convertDateRange = function (timeCode) {
        var d = {};
        switch (timeCode) {
            case 'HN':
                {
                    var t = moment(new Date());
                    d.from = t.format("DD/MM/YYYY");
                    d.to = t.format("DD/MM/YYYY");
                }
                break;
            case 'HQ':
                {
                    var tmr = moment(new Date()).add(-1, 'days');
                    d.from = tmr.format("DD/MM/YYYY");
                    d.to = tmr.format("DD/MM/YYYY");
                }
                break;
            case 'TN':
                {
                    d.from = moment().startOf('isoweek').format("DD/MM/YYYY");
                    d.to = moment().endOf('isoweek').format("DD/MM/YYYY");
                }
                break;
            case 'DTDHT':
                {
                    d.from = moment().startOf('isoweek').format("DD/MM/YYYY");
                    d.to = moment(new Date()).format("DD/MM/YYYY");
                }
                break;
            case 'TTR':
                {
                    var t = moment(new Date()).add(-1, 'weeks');
                    d.from = t.startOf('isoweek').format("DD/MM/YYYY");
                    d.to = t.endOf('isoweek').format("DD/MM/YYYY");
                }
                break;
            case 'THN':
                {
                    d.from = moment().startOf('month').format("DD/MM/YYYY");
                    d.to = moment().endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'THTR':
                {
                    var t = moment(new Date()).add(-1, 'months');
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'DTHDHT':
                {
                    d.from = moment().startOf('month').format("DD/MM/YYYY");
                    d.to = moment().format("DD/MM/YYYY");
                }
                break;
            case 'QN':
                {
                    d.from = moment().startOf('quarter').format("DD/MM/YYYY");
                    d.to = moment().endOf('quarter').format("DD/MM/YYYY");
                }
                break;
            case 'DQDHT':
                {
                    d.from = moment().startOf('quarter').format("DD/MM/YYYY");
                    d.to = moment().format("DD/MM/YYYY");
                }
                break;
            case '6TDN':
                {
                    var t = moment().startOf('year');
                    d.from = t.format("DD/MM/YYYY");
                    d.to = t.add(6, 'months').format("DD/MM/YYYY");
                }
                break;
            case '6TCN':
                {
                    var t = moment().endOf('year');
                    d.to = t.format("DD/MM/YYYY");
                    d.from = t.add(-6, 'months').format("DD/MM/YYYY");
                }
                break;
            case 'NN':
                {
                    d.from = moment().startOf('year').format("DD/MM/YYYY");
                    d.to = moment().endOf('year').format("DD/MM/YYYY");
                }
                break;
            case 'NTR':
                {
                    var t = moment().add(-1, 'year');
                    d.from = t.startOf('year').format("DD/MM/YYYY");
                    d.to = t.endOf('year').format("DD/MM/YYYY");
                }
                break;
            case 'DNDHT':
                {
                    d.from = moment().startOf('year').format("DD/MM/YYYY");
                    d.to = moment().format("DD/MM/YYYY");
                }
                break;
            case 'Q1':
                {
                    var t = moment().startOf('year');
                    d.from = t.startOf('quarter').format("DD/MM/YYYY");
                    d.to = t.endOf('quarter').format("DD/MM/YYYY");
                }
                break;
            case 'Q2':
                {
                    var t = moment().startOf('year').add(4, 'months');
                    d.from = t.startOf('quarter').format("DD/MM/YYYY");
                    d.to = t.endOf('quarter').format("DD/MM/YYYY");
                }
                break;
            case 'Q3':
                {
                    var t = moment().startOf('year').add(7, 'months');
                    d.from = t.startOf('quarter').format("DD/MM/YYYY");
                    d.to = t.endOf('quarter').format("DD/MM/YYYY");
                }
                break;
            case 'Q4':
                {
                    var t = moment().startOf('year').add(10, 'months');
                    d.from = t.startOf('quarter').format("DD/MM/YYYY");
                    d.to = t.endOf('quarter').format("DD/MM/YYYY");
                }
                break;
            case 'T1':
                {
                    var t = moment([new Date().getFullYear(), 0, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T2':
                {
                    var t = moment([new Date().getFullYear(), 1, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T3':
                {
                    var t = moment([new Date().getFullYear(), 2, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T4':
                {
                    var t = moment([new Date().getFullYear(), 3, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T5':
                {
                    var t = moment([new Date().getFullYear(), 4, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T6':
                {
                    var t = moment([new Date().getFullYear(), 5, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T7':
                {
                    var t = moment([new Date().getFullYear(), 6, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T8':
                {
                    var t = moment([new Date().getFullYear(), 7, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T9':
                {
                    var t = moment([new Date().getFullYear(), 8, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T10':
                {
                    var t = moment([new Date().getFullYear(), 9, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T11':
                {
                    var t = moment([new Date().getFullYear(), 10, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            case 'T12':
                {
                    var t = moment([new Date().getFullYear(), 11, 1]);
                    d.from = t.startOf('month').format("DD/MM/YYYY");
                    d.to = t.endOf('month').format("DD/MM/YYYY");
                }
                break;
            default:
        }
        return d;
    },
    createEmptyModal = function (opt) {
        if ($(opt.id).length == 0) {
            if (opt.width == null) {
                opt.width = 700;
            }
            var w = $.isNumeric(opt.width) ? opt.width + 'px' : opt.width;
            var h = '<div id="' +
                opt.id +
                '" class="modal"  role="dialog" data-backdrop="static">' +
                '<div class="modal-dialog" role="document" style="width: ' +
                w +
                '">' +
                '<div class="modal-content">' +
                '<div class="modal-header ' +
                (opt.headerClass != null ? opt.headerClass : '') +
                '">' +
                '<h5 class="modal-title text-bold" >' +
                opt.title +
                '</h5>' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                '</div>';
            if (opt.model != null) {
                h += '<form id="' +
                    opt.model +
                    'Form" class="form-horizontal">' +
                    '<div class="modal-body ' +
                    (opt.noPaddingBody ? 'no-padding' : 'p-15') +
                    '"></div>';

                if (opt.noFooter == null || !opt.noFooter) {
                    h += '<div class="panel-footer p-15">' +
                        '<div class="pull-right">' +
                        '<button class="btn btn-sm btn-default form-cancel mr-10 btn-rounded" data-dismiss="modal">' +
                        '<i class="icon-x position-left"></i>Đóng' +
                        '</button>' +
                        '<button class="btn btn-sm btn-primary btn-submit btn-rounded" type="button" ' +
                        'data-loading-text="<i class=' +
                        "'icon-spinner4 fa-spin'" +
                        '></i> Đang xử lý ...">' +
                        '<i class="icon-floppy-disk position-left"></i>Lưu lại' +
                        '</button>' +
                        '</div>' +
                        '</div>';
                }

                h += '</form>';
            }
            else {
                h += '<div class="modal-body ' +
                    (opt.noPaddingBody ? 'no-padding' : 'p-15') +
                    '">' +
                    '</div>';
            }

            h += '</div>' +
                '</div>' +
                '</div>';


            $(opt.appendTo != null ? opt.appendTo : 'body').append(h);
        }
    },
    isHoliday = function (v) {
        var f = null;
        if (typeof holidays != 'undefined' && holidays != null) {
            v = moment(v);
            $(holidays).each(function () {
                var d1 = moment(this.TuNgay);
                var d2 = moment(this.DenNgay);
                if (d1 <= v && v <= d2) {
                    f = this;
                    return;
                }
            });
        }
        return f;
    },
    createPartialModal = function (opt, callback) {
        var m = opt.modal.id;
        if ($('#' + m).length == 0) {
            app.createEmptyModal(opt.modal);
        }
        var data = $.extend(opt.data,
            {
                dataType: 'html'
            });
        app.loadData(opt.url,
            data,
            null,
            function (html) {
                $('#' + m + ' .modal-body').html(html);
                $('#' + m).modal('show');

                $('.modal').on('shown.bs.modal',
                    function () {
                        $(document).off('focusin.modal');
                    });

                if (callback != null) {
                    callback();
                }
            });
    },
    showModalLoading = function (id) {
        if ($('#' + id).length > 0) {
            $('#' + id + ' .modal-loader').css('display', 'block');
        }
    },
    hideModalLoading = function (id) {
        if ($('#' + id).length > 0) {
            $('#' + id + ' .modal-loader').css('display', 'none');
        }
    },
    confirmCause = function (obj) {
        var guid = app.newGuid(10);
        swal({
            title: obj.title,
            text: '<p>Anh/Chị vui lòng cho biết lý do ' +
                obj.title.toLowerCase() +
                '</p>' +
                '<textarea id="confirm_' +
                guid +
                '" class="form-control" placeHolder="Lý do không đồng ý duyệt ' +
                obj.title.toLowerCase() +
                '"></textarea>',
            html: true,
            showCancelButton: true,
            closeOnConfirm: false,
            confirmButtonColor: "#ff5722",
            cancelButtonText: "Để sau",
            confirmButtonText: "Hoàn tất",
            showLoaderOnConfirm: true
        },
            function (isConfirm) {
                if (!isConfirm) return;
                var cause = $('#confirm_' + guid).val();
                if (cause === "") {
                    swal.showInputError("Anh/Chị vui lòng nhập lý do " + obj.title.toLowerCase());
                    return false;
                }
                if (obj.data == null) {
                    obj.data = {};
                }
                obj.data.lydo = cause;
                app.postData(obj.url,
                    obj.data,
                    function (result) {
                        if (result.Success) {
                            swal({
                                title: "Thao tác thành công",
                                type: 'success'
                            },
                                function () {
                                    if (obj.callback != null) {
                                        obj.callback(true);
                                    }
                                });
                        } else {
                            swal(result.Message, '', "error");
                            if (obj.callback != null) {
                                obj.callback(false);
                            }
                        }
                    });
            });
    },
    round = function (value, exp) {
        if (typeof exp === 'undefined' || +exp === 0)
            return Math.round(value);
        value = +value;
        exp = +exp;
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
            return NaN;

        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
    },
    set_select2_data = function (ele, obj) {
        ele.select2('data', obj).trigger('change');
    },

    loading_async_data = function (opt) {
        var m = '.loading-async-modal';
        switch (opt.mode) {
            case 0:
                {
                    var index = 0;
                    var html =
                        '<div class="modal fade loading-async-modal update-async-modal" data-backdrop="static" role="dialog" >' +
                        '<div class="modal-dialog modal-sm" role="document"><div class="modal-content"><div class="media no-margin stack-media-on-mobile">' +
                        '<div class="media-left media-middle"><div class="process-circle">' +
                        '<svg class="progress-ring" width="60" height="60"><circle class="progress-ring__circle" stroke="#2196F3" stroke-width="3" fill="transparent" r="27" cx="30" cy="30"/></svg>' +
                        '<span class="progress-percent" >0%</span></div></div><div class="media-body pr-10 pt-15">' +
                        '<h6 class="media-heading text-bold" style="height: 49px; vertical-align:middle; line-height: 44px;">' +
                        '<span style="display: inline-block;  line-height: normal;">' +
                        opt.text +
                        '</span>' +
                        '</h6> ' +
                        '</div></div></div></div></div>';
                    $('body').append(html);

                    $(m).modal('show');

                    var circle = document.querySelector(m + ' circle');
                    circle.style.strokeDashoffset = 0;
                    $(m + ' .progress-percent').text('0%');
                }
                break;
            case 1:
                {
                    var circle, radius, circumference, percent;
                    circle = document.querySelector(m + ' circle');
                    radius = circle.r.baseVal.value;
                    circumference = radius * 2 * Math.PI;
                    percent = Math.floor(opt.tl * 100);
                    var offset = circumference - percent / 100 * circumference;
                    circle.style.strokeDashoffset = percent != 100 ? offset : 0;
                    $(m + ' .progress-percent').text(percent + '%');
                }
                break;
            case 2:
                {
                    $(m).modal('hide');
                    setTimeout(function () {
                        $(m).remove();
                    },
                        400);
                }
                break;
            default:
        }
    },
    show_broser_notify = function (title, message, clickCallback) {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        else if (Notification.permission === "granted") {
            var notification = new Notification(title, {
                icon: _logo,
                body: message,
            });

            notification.onclick = function () {
                if (clickCallback != null) {
                    clickCallback();
                }
            };
            notification.onclose = function () {
                console.log('Notification closed');
            };
        }
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    var notification = new Notification(title, {
                        icon: _logo,
                        body: message,
                    });
                    notification.onclick = function () {
                        if (clickCallback != null) {
                            clickCallback();
                        }
                    };
                    notification.onclose = function () {
                        console.log('Notification closed');
                    };
                }
            });
        }
    },
    show_body_loading = function (text) {
        var m = 'body-loading-modal';
        if ($(m).length == 0) {
            var html =
                '<div id=' + m + ' class="modal fade " data-backdrop="static" role="dialog" >' +
                '<div class="modal-dialog modal-sm" role="document">' +
                '<div class="modal-content"><div class="modal-body"><div class="media">' +
                '<div class="media-left">' +
                '<i class="icon-spinner10 spinner icon-2x text-primary mt-5"></i>' +
                '</div>' +
                '<div class="media-body" > ' +
                '<h6>' + text + '</h6> ' +
                '</div> ' +
                '</div></div></div></div>';
            $('body').append(html);
        }
        $('#' + m).modal('show');
    },
    hide_body_loading = function () {
        $('#body-loading-modal').modal('hide');
    },
    push_broswer_title_alert = function (mes) {
        $.titleAlert(mes, { stopOnFocus: true, interval: 500 });
    },
    mediaObj = function (obj) {
        var html = '<div class="media media-' + obj.size + '" ';
        if (obj.attrs != null) {
            html += obj.attrs.join(' ');
        }

        html += '>';

        if (obj.img != null) {
            html += '<div class="media-left">';
            html += '<img data-src="' + obj.img + '" src="/file/1px.svg" class="img-circle lazy" /></div>';
        }
        html += '<div class="media-body">';
        if (obj.link != null) {
            if (obj.link.url != null) {
                html += '<a  class="media-heading text-bold" class="" href="' + obj.link.url + '" target="' + (obj.link.newTab ? '_blank' : '') +
                    '">' + obj.title + '</a>';
            } else {
                html += '<a  href="javascript:void(0)" class="media-heading text-bold ' + obj.class + '" dataid="' + obj.id + '">' + obj.title + '</a>';
            }
        } else {
            html += '<p class="media-heading text-bold">' + obj.title + '</p>';
        }

        if (obj.sub.length > 0) {
            for (var i = 0; i < obj.sub.length; i++) {
                html += '<span class="display-block text-muted">' + obj.sub[i] + '</span>';
            }
        }

        html += '</div></div>';
        return html;
    };

var app = function () {
    "use strict";
    return {
        init: function (params) { },
        formatPrice: function (val) {
            return formatPrice(val);
        },
        sub: function (str, len) {
            return _substr(str, len);
        },
        pagination: function (element, total, currentPage, pageSize, query) {
            pagination(element, total, currentPage, pageSize, query);
        },
        niceStrToObject: function (str) {
            return convertNiceStrToObject(str);
        },
        newGuid: function (length) {
            return newGuid(length);
        },
        alert: function (type, message) {
            return app_alert(type, message);
        },
        loading: function (hide) {
            return setLoading(hide);
        },
        loadData: function (url, params, page, callback) {
            loadData(url, params, page, callback);
        },
        postData: function (url, params, callback, forForm) {
            postData(url, params, callback, forForm);
        },
        hasValue: function (v) {
            return hasValue(v);
        },
        toKeyword: function (str) {
            return toKeyword(str);
        },
        showPanelLoading: function (panel) {
            return showPanelLoading(panel);
        },
        hidePanelLoading: function (panel) {
            return hidePanelLoading(panel);
        },
        requestAuth: function (callback) {
            requestAuth(callback);
        },
        val: function (obj, attr) {
            return val(obj, attr);
        },
        showModalLoading: function (id) {
            return showModalLoading(id);
        },
        hideModalLoading: function (id) {
            return hideModalLoading(id);
        },
        thumb: function (type, fileName, size) {
            return thumb(type, fileName, size);
        },
        mapConditions: function () {
            return mapConditions();
        },
        convertVnToEnDate: function (d) {
            return convertVnToEnDate(d);
        },
        convertVnToEnDateTime: function (d) {
            return convertVnToEnDateTime(d);
        },
        confirm: function (type, title, text, callback) {
            return app_confirm(type, title, text, callback);
        },
        confirmAjax: function (opt) {
            return app_confirm_ajax(opt);
        },

        notify: function (type, message, br) {
            return app_notify(type, message, br);
        },
        idImage: function (type, media, id, thumbsize, name, companyId) {
            return idImage(type, media, id, thumbsize, name, companyId);
        },
        guidImage: function (type, media, guid) {
            return guidImage(type, media, guid);
        },
        idFolder: function (path, id) {
            return idFolder(path, id);
        },
        beatyTime: function (time) {
            return beatyTime(time);
        },
        formatBeatyDateTime: function () {
            return formatBeatyDateTime();
        },
        formatDate: function (obj, lang) {
            return formatDate(obj, lang);
        },
        formatDateTime: function (obj, lang) {
            return formatDateTime(obj, lang);
        },
        formatTime: function (obj) {
            return formatTime(obj);
        },
        toAid: function (id, c, len) {
            return toAid(id, c, len);
        },
        formatJsDate: function (obj) {
            return formatJsDate(obj);
        },
        convertIsoDateToJsDate: function (obj, lang, hasTime) {
            return convertIsoDateToJsDate(obj, lang, hasTime);
        },
        isEmailValid: function (str) {
            return emailValid(str);
        },
        convertCToJsDate: function (obj, lang, hasTime) {
            return convertCToJsDate(obj, lang, hasTime);
        },
        lazyLoader: function () {
            lazyLoader();
        },
        rateRender: function () {
            return rateRender();
        },
        replaceBrToNewLine: function (str) {
            return replaceBrToNewLine(str);
        },
        replaceNewLineToBr: function (str) {
            return replaceNewLineToBr(str);
        },
        createEmptyModal: function (opt) {
            return createEmptyModal(opt);
        },
        formDataToJson: function (formData) {
            return formDataToJson(formData);
        },
        convertDateRange: function (timeCode) {
            return convertDateRange(timeCode);
        },
        cleanJson: function (obj) {
            return cleanJson(obj);
        },
        round: function (num, exp) {
            return round(num, exp);
        },
        createPartialModal: function (opt, callback) {
            return createPartialModal(opt, callback);
        },
        confirmCause: function (opt) {
            return confirmCause(opt);
        },
        isHoliday: function (v) {
            return isHoliday(v);
        },
        updateAsyncData: function (obj) {
            return update_async_data(obj);
        },
        loadingAsyncData: function (obj) {
            return loading_async_data(obj);
        },
        confirmDuyet: function (url, data, callback) {
            return confirm_duyet(url, data, callback);
        },
        confirmKhongDuyet: function (url, data, callback) {
            return confirm_khong_duyet(url, data, callback);
        },
        setSelect2Data: function (ele, data) {
            return set_select2_data(ele, data);
        },
        roundToNearest: function (v, n) {
            return roundToNearest(v, n);
        },
        mediaObj: function (obj) {
            return mediaObj(obj);
        },
        hasVnChars: function (str) {
            return has_vnChars(str);
        },
        showBodyLoading: function (text) {
            return show_body_loading(text);
        },
        hideBodyLoading: function () {
            return hide_body_loading();
        },
        pushBrowserNotify: function (title, message, clickCallback) {
            return show_broser_notify(title, message, clickCallback);
        },
        pushBrowserTitleAlert: function (message) {
            return push_broswer_title_alert(message);
        }
    };
}();