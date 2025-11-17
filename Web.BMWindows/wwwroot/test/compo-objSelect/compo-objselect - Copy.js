
(function ($) {
    $.fn.compoObjSelect = function (options) {
        var s = this;
        var selector = this.selector;
        var set = $.extend({
            api: '',
            selectCallback: null,
            width: null,
            groupSize: null,
            ajax: null,
            attr: null,
            placeHolder: null,
            name: null
        },
            options);
        var item = set.item;
        s.container = null;
        s.data = null;
        s.som = '#objectSelectorModal';
        s.orgTempList = [];
        function setOrgProp(s, obj) {
            s.Id = ko.observable(obj.Id);
            s.Name = ko.observable(obj.Name + ' (' + obj.TotalEmployee + ')');
            s.ParentId = ko.observable(obj.ParentId);
            s.PrivateCount = ko.observable(obj.PrivateCount);
            s.OrgLevelId = ko.observable(obj.OrgLevelId);
            s.OrgLevel = ko.observable(obj.OrgLevel);
        }

        function setOrgDefault(s) {
            s.Id = ko.observable(0);
            s.Name = ko.observable('');
            s.ParentId = ko.observable(null);
            s.PrivateCount = ko.observable(false);
            s.OrgLevelId = ko.observable(null);
            s.OrgLevel = ko.observable({
                MoRong1: ''
            });
            s.TotalEmployee = ko.observable(0);
        }

        var DefaultOrg = {
            Id: 0,
            Name: '',
            ParentId: '',
            PrivateCount: false,
            OrgLevelId: 0,
            OrgLevel: { MoRong1: '' },
            TotalEmployee: 0
        };

        var ParentOrg = function (obj) {
            var s = this;
            if (obj != null) {
                ko.mapping.fromJS(obj, {}, s);
                s.totalChilds = ko.observable(obj.childs().length);
            }
            else {
                ko.mapping.fromJS(DefaultOrg, {}, s);
                s.totalChilds = ko.observable(0);
            }
            s.isShowChild = ko.observable(true);
            s.active = ko.observable(false);
            s.top = ko.observable(0);
            s.left = ko.observable(0);
            s.focus = ko.observable(false);
        };

        var Org = function (obj, parent, so) {
            var t = this;
            t.so = so;
            t.childs = ko.observableArray([]);
            if (obj != null) {
                setOrgProp(t, obj);
            } else {
                setOrgDefault(t);
            }
            t.parent = ko.observable(new ParentOrg(parent));
            t.isShowChild = ko.observable(true);
            t.active = ko.observable(false);
            t.isChecked = ko.observable(false); 
            if (obj != null && obj.Childs != null) {
                $.each(obj.Childs, function () {
                    s.orgTempList.push({
                        id: this.Id,
                        keyword: this.Keyword,
                        name: this.Name
                    });
                    t.childs.push(new Org(this, t, so));
                });
            }
        };
        var OrgListItem = function (obj) {
            var t = this;
            t.Id = obj.id;
            t.Keyword = obj.keyword;
            t.Name = obj.name;
            t.active = ko.observable(false);
            t.selected = ko.observable(false);
            t.visible = ko.observable(false); 
        };
        var ObjItem = function (obj) {
            var o = this;
            o.Id = obj.Id;
            o.Name = obj.Name + ' (' + obj.TotalEmployee + ')';
            o.Keyword = obj.Keyword;
            o.selected = ko.observable(false);
            o.Total = ko.observable(obj.Total);
        }
        var ObjEmpItem = function (obj) {
            var o = this;
            o.Id = obj.Id;
            o.FullName = obj.FullName;
            o.Keyword = obj.Keyword;
            o.Image = obj.Avatar;
            o.JobPositionName = obj.JobPositionName;
            o.selected = ko.observable(false);
        }
        var OrgControl = function () {
            var t = this;
            t.data = ko.observableArray([]);
            t.key = ko.observable('');
            t.loaded = ko.observable(false);
            t.tree = ko.observableArray([]);
            t.list = ko.observableArray([]);
            t.orgTreeData = [];
            t.searching = ko.observable(false);
            t.treeEvents = function () { 
                $(s.orgTempList).each(function () {
                    t.list.push(new OrgListItem(this));
                })

                $(s.som + ' .search-org-control').keyup(function () {
                    var k = $(this).val();
                    if (k.length > 0) { 
                        t.searching(true);

                        $(t.list()).each(function () {
                            if (this.Keyword != null && this.Keyword.indexOf(k) >= 0) {
                                this.visible(true);
                            } else {
                                this.visible(false);
                            }
                        });
                    } else {
                        t.searching(false);
                    }
                });
            }

            t.checkTreeChild = function (obj) {
                var c = obj.isChecked();
                obj.isChecked(!c);
                if (obj.childs().length > 0) {
                    t.checkChilds(obj, !c, true);
                }
            };
            t.checkChilds = function (p, check, includeChild) {
                $(p.childs()).each(function () {
                    this.isChecked(check);
                    if (includeChild) {
                        if (this.childs().length > 0) {
                            t.checkChilds(this, check, includeChild);
                        }
                    }
                });
            };

            t.setCheckNode = function (p, id, check) {
                $(p).each(function () {
                    if (id != null) {
                        if (this.Id() == id) {
                            this.isChecked(check);
                        } else {
                            if (this.childs().length > 0) {
                                t.setCheckNode(this.childs(), id, check);
                            }
                        }
                    }
                    else {
                        this.isChecked(check);
                        if (this.childs().length > 0) {
                            t.setCheckNode(this.childs(), null, check);
                        }
                    }
                });
            }

            t.setSelectListItem = function (id, check) {
                $(t.list()).each(function () {
                    if (this.Id == id) {
                        this.selected(check);
                    }
                })
            }

            t.getCheckedChilds = function (list, p) {
                $(p.childs()).each(function () {
                    if (this.isChecked()) {
                        list.push({
                            id: this.Id(),
                            text: this.Name()
                        });
                    }
                    list = t.getCheckedChilds(list, this);
                });
                return list;
            };
            t.start = function () {
                app.loadData(set.api + '/general/OrganizationListForTree',
                    {
                        unlimited: true,
                        cache: true,
                        HasSummary: true
                    },
                    null,
                    function (r) {
                        t.loaded(true);
                        t.orgTreeData = r;
                        $('.tree-container .overlay').css('display', 'none');
                        if (t.tree().length > 0) {
                            t.tree.removeAll();
                        };

                        console.log(s.orgTempList);

                        s.orgTempList.push({
                            id: r.Id,
                            keyword: r.Keyword,
                            name: r.Name
                        })
                        t.tree.push(new Org(t.orgTreeData, null, s.guid));
                        t.treeEvents();
                    });
            }
        }

        var PositionControl = function () {
            var t = this;
            t.data = ko.observableArray([]);
            t.key = ko.observable('');
            t.loaded = ko.observable(false);
            t.clear = function () {
                $(t.data()).each(function () {
                    if (this.selected()) {
                        this.selected(false);
                    }
                })
            }
            t.start = function () {
                app.loadData(set.api + '/category/jobPositionTotalBaseList',
                    {
                        unlimited: true,
                        cache: true,
                        HasSummary: true
                    },
                    null,
                    function (result) {
                        t.loaded(true);
                        $(result).each(function () {
                            t.data.push(new ObjItem(this));
                        })
                    });
            }
        }

        var TitleControl = function () {
            var t = this;
            t.data = ko.observableArray([]);
            t.key = ko.observable('');
            t.loaded = ko.observable(false);
            t.clear = function () {
                $(t.data()).each(function () {
                    if (this.selected()) {
                        this.selected(false);
                    }
                })
            }
            t.start = function () {
                app.loadData(set.api + '/general/JobTitleTotalBaseList',
                    {
                        unlimited: true,
                        cache: true,
                        HasSummary: true
                    },
                    null,
                    function (result) {
                        t.loaded(true);
                        $(result).each(function () {
                            t.data.push(new ObjItem(this));
                        })
                    });
            }
        }

        var EmpControl = function () {
            var t = this;
            t.data = ko.observableArray([]);
            t.key = ko.observable('');
            t.loaded = ko.observable(false);
            t.clear = function () {
                $(t.data()).each(function () {
                    if (this.selected()) {
                        this.selected(false);
                    }
                })
            }
            t.start = function () {
                app.loadData(set.api + '/employee/EmployeeSuggestionViewList',
                    {
                        limit: 10,
                        trangThaiCongViecStr: '0,1,4'
                    },
                    null,
                    function (result) {
                        t.loaded(true);
                        $(result).each(function () {
                            t.data.push(new ObjEmpItem(this));
                        })
                    });
            }
        }

        var ObjViewModel = function () {
            var o = this;
            o.mode = ko.observable(0);
            o.org = ko.observable(new OrgControl());
            o.position = ko.observable(new PositionControl());
            o.title = ko.observable(new TitleControl());
            o.emp = ko.observable(new EmpControl());

            o.selectedPos = ko.observableArray([]);
            o.selectedTitles = ko.observableArray([]);
            o.selectedEmps = ko.observableArray([]);
            o.selectedOrgs = ko.observableArray([]);

            o.selectEmp = function (x) {
                var v = x.selected();
                x.selected(!v);
                o.compute();
            }
            o.selectPosition = function (x) {
                var v = x.selected();
                x.selected(!v);
                o.compute();
            }
            o.selectTitle = function (x) {
                var v = x.selected();
                x.selected(!v);
                o.compute();
            }
            o.selectOrgList = function (x) {
                var v = x.selected();
                v = !v;
                x.selected(v); 
                o.org().setCheckNode(o.org().tree(), x.Id, v);
                o.compute();
            }
            o.removePos = function (x) {
                x.selected(false);
                o.selectedPos.remove(x);
            }
            o.removeOrg = function (x) {
                o.org().setCheckNode(o.org().tree(), x.id, false);
                o.org().setSelectListItem(x.id, false);
                o.selectedOrgs.remove(x);
                o.compute();
            }
            o.removeTitle = function (x) {
                x.selected(false);
                o.selectedTitles.remove(x);
            }
            o.removeEmp = function (x) {
                x.selected(false);
                o.selectedEmps.remove(x);
            }
            o.compute = function () {
                o.selectedPos.removeAll();
                o.selectedTitles.removeAll(); 
                o.selectedOrgs.removeAll();
                $(o.position().data()).each(function () {
                    if (this.selected()) {
                        o.selectedPos.push(this);
                    }
                });
                $(o.title().data()).each(function () {
                    if (this.selected()) {
                        o.selectedTitles.push(this);
                    }
                });
                $(o.emp().data()).each(function () {
                    if (this.selected()) {
                        var x = this;
                        var exist = false;
                        $(o.selectedEmps()).each(function () {
                            if (this.Id == x.Id) {
                                exist = true;
                                return;
                            }
                        });
                        if (!exist) {
                            o.selectedEmps.push(x);
                        }
                    }
                });

                var orgs = [];
                $(o.org().tree()).each(function () {
                    if (this.isChecked()) {
                        orgs.push({
                            id: this.Id(),
                            text: this.Name()
                        });
                    }
                    orgs = o.org().getCheckedChilds(orgs, this);
                });

                //$(o.org().list()).each(function () {
                //    if (this.selected()) {
                //        orgs.push({
                //            id: this.Id,
                //            text: this.Name
                //        });
                //    } 
                //});

                $(orgs).each(function () {
                    o.selectedOrgs.push(this);
                })
            };

            o.selectMode = function (m) {
                o.mode(m);
                switch (m) {
                    case 1: {
                        if (!o.title().loaded()) {
                            o.title().start();
                        }

                    } break;
                    case 2: {
                        if (!o.position().loaded()) {
                            o.position().start();
                        }
                    } break;
                    case 3: {
                        if (!o.emp().loaded()) {
                            o.emp().start();
                        }
                    } break;
                }
            }

            o.checkTreeChild = function (obj) {
                var c = obj.isChecked();
                c = !c;
                obj.isChecked(c);
                if (obj.childs().length > 0) {
                    o.checkChilds(obj, c);
                }

                o.compute();
            };
            
            o.checkChilds = function (p, check) {
                $(p.childs()).each(function () {
                    this.isChecked(check);
                    if (this.childs().length > 0) {
                        o.checkChilds(this, check);
                    }
                });
            };

            o.init = function () {
                o.selectedEmps.removeAll();
                o.selectedOrgs.removeAll();
                o.selectedPos.removeAll();
                o.selectedTitles.removeAll();

                o.position().clear();
                o.title().clear();
                o.emp().clear();
                o.org().setCheckNode(o.org().tree(), null, false);

                if (!o.org().loaded()) {
                    o.org().start();
                }
            }

            o.getReturnData = function () {
                var result = [
                    { type: 0, data: [] },
                    { type: 1, data: [] },
                    { type: 2, data: [] },
                    { type: 3, data: [] },
                ];

                if (o.selectedOrgs().length > 0) {
                    $(o.selectedOrgs()).each(function () {
                        result[0].data.push(this);
                    })
                }
                if (o.selectedTitles().length > 0) {
                    $(o.selectedTitles()).each(function () {
                        result[1].data.push({
                            id: this.Id,
                            text: this.Name
                        });
                    })
                }
                if (o.selectedPos().length > 0) {
                    $(o.selectedPos()).each(function () {
                        result[2].data.push({
                            id: this.Id,
                            text: this.Name
                        });
                    })
                }
                if (o.selectedEmps().length > 0) {
                    $(o.selectedEmps()).each(function () {
                        result[3].data.push({
                            id: this.Id,
                            text: this.FullName
                        });
                    })
                }

                return result;
            }

            o.init();

        }

        s.vm = new ObjViewModel();
        s.callback = null;
        s.events = function () {
            $(s.som + ' .btn-return-obj').click(function () {
                var data = s.vm.getReturnData();
                if (s.callback != null) {
                    s.callback(data);
                }
                $(s.som).modal('hide');
            });
        }
        s.getObjs = function (callback) {
            s.callback = callback;
            $(s.som).modal('show');
            s.vm.init();
        }

        s.init = function () {
            ko.applyBindings(s.vm, $(s.som)[0]);
            s.events();
        };
        s.init();


        return s;
    };
}(jQuery));

