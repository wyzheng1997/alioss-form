(function(){
    var ringChart = function(canvas_id, curr) {
        var canvas = document.getElementById(canvas_id);
        var total = 100;
        var constrast = parseFloat(curr / total).toFixed(2); //比例
        if(constrast > 1) {return;}
        canvas.height=canvas.height + 0;
        var context = null;
        if (!canvas.getContext) { return;}
        // 定义开始点的大小
        var startArc = Math.PI * 1.5;
        // 根据占的比例画圆弧
        var endArc = (Math.PI * 2) * constrast;
        context = canvas.getContext("2d");
        // 圆心文字
        context.font = "16px Arial";
        context.fillStyle = '#ff801a';
        context.textBaseline = 'middle';
        var text = (Number(curr / total) * 100).toFixed(0) + "%";
        var tw = context.measureText(text).width;
        context.fillText(text, 45 - tw / 2, 45);
        // 绘制背景圆
        context.save();
        context.beginPath();
        context.strokeStyle = "#e7e7e7";
        context.lineWidth = "4";
        context.arc(45, 45, 30, 0, Math.PI * 2, false);
        context.closePath();
        context.stroke();
        context.restore();
        // 若为百分零则不必再绘制比例圆
        if (curr / total === 0) { return;}
        // 绘制比例圆
        context.save();
        context.beginPath();
        context.strokeStyle = "#ff801a";
        context.lineWidth = "4";
        context.arc(45, 45, 30, startArc, (curr % total === 0 ? startArc : (endArc + startArc)), false);
        context.stroke();
        context.restore();

        // 绘制边框
        context.save();
        context.beginPath();
        context.strokeStyle = "#ff801a";
        context.lineWidth = "2";
        context.strokeRect(0,0,90,90);
        context.stroke();
        context.restore();
    };

    var accessid = '', host = '', cdn_url = '', policyBase64 = '',
        signature = '', key = '', expire = 0, filename_new = '', file_ext = '';

    //获取签名函数
    function get_signature(callback) {
        var now = timestamp = Date.parse(new Date()) / 1000;
        if (expire < now + 300) {//300s缓冲
            //ajax
            $.ajax({
                url:'/admin/alioss_param',
                type:'get',
                dataType:'json',
                async: false,//同步
                success:function(obj) {
                    accessid = obj['accessid'];
                    host = obj['host'];
                    cdn_url = obj['cdn_url'];
                    policyBase64 = obj['policy'];
                    signature = obj['signature'];
                    expire = parseInt(obj['expire']);
                    key = obj['dir'];
                    callback && callback();
                },
                error:function() {
                    alert("抱歉！获取签名错误！");
                }
            });
        }else{
            callback && callback();
        }
    }
    //重设plupload参数
    function set_upload_param(up, filename) {
        //获取签名
        get_signature(function(){
            new_multipart_params = {
                'key': key + filename,//+ '${filename}',
                'policy': policyBase64,
                'OSSAccessKeyId': accessid,
                'success_action_status': '200',//让服务端返回200, 默认204
                'signature': signature,
            };
            up.setOption({
                'url': host,
                'multipart_params': new_multipart_params
            });
        });
    }
    //指定长度的随机字符串
    function random_string(len) {
        len = len || 32;
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var maxPos = chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    //获取文件的后缀名
    function get_suffix(filename) {
        var pos = filename.lastIndexOf('.');
        var suffix = '';
        if (pos !== -1) {
            suffix = filename.substring(pos)
        }
        return suffix.toLowerCase();
    }

    // 删除事件
    window.del_pic = function(obj, multi) {
        obj = $(obj);
        var filename = '';
        if(multi) {
            filename = obj.attr('data-filename');
            var upload_warp = obj.parents('div.upload_warp');
            obj.parents('div.upload_item').remove();
            if(upload_warp.find('.upload_item').length === 0) {
                upload_warp.hide();
            }
        }else{
            var warp = obj.parent();
            filename = warp.find('img').attr('data-filename');
            warp.find('img').remove();
            warp.find('.upload_add_img').show();
            warp.find('input.Js_upload_input').val('');
        }
    }

    // 图片上传
    window.init_upload = function(id, multi, token){
        var element = $('#'+id);
        var upload_warp = multi ? $(element.attr('data-warp')) : element.parents('.Js_upload_warp');
        var container = $('<div style="height:0px;width:0px;display:none"></div>').appendTo(upload_warp);
        if(multi) {
            Sortable.create(upload_warp.get(0), {
                group: {
                    pull: false,
                    put: false
                },
                handle: 'img',
                ghostClass: 'upload_ghost',
                chosenClass: 'upload_chose',
            });
        }
        var uploader = new plupload.Uploader({
            runtimes : 'html5,flash,silverlight,html4',
            browse_button : id,//'pickfiles',
            container: container.get(0),//document.getElementById('container'),
            url : '/admin/upload_file',
            flash_swf_url : './plupload-2.1.2/Moxie.swf',
            silverlight_xap_url : './plupload-2.1.2/Moxie.xap',
            multi_selection: multi,//false单选，true多选
            multipart_params: { '_token' : token },
            //过滤
            filters : {
                max_file_size : '10mb',
                mime_types: [
                    {title : "Image files", extensions : "jpg,jpeg,gif,png"}
                ]
            },

            init: {
                FilesAdded: function(up, files) {
                    plupload.each(files, function(file) {
                        if(multi) {
                            // 多图
                            upload_warp.css('opacity',1).append('<div class="upload_item" id="'+file.id+'"><canvas id="'+file.id+'_canvas" width="90px" height="90px"></canvas></div>').show();
                        }else{
                            // 单图
                            element.hide();
                            upload_warp.prepend('<canvas id="'+file.id+'_canvas" width="90px" height="90px" style="margin-top: 5px;"></canvas>')
                        }
                        ringChart(file.id+'_canvas', 0);
                    });
                    uploader.start();//选择文件后立即上传
                },
                BeforeUpload: function(up, file) {
                    //设置新文件名
                    file_ext = get_suffix(file.name); //后缀名
                    filename_new = Date.parse(new Date()) / 1000 + '_' + random_string(10) + file_ext;
                    set_upload_param(up, filename_new); //重设参数
                },
                UploadProgress: function(up, file) {
                    ringChart(file.id+'_canvas', file.percent);
                },
                FileUploaded: function(up, file, info) {
                    var path = key + filename_new;
                    var all_path = cdn_url + '/' + path;
                    if(multi) {
                        $('#'+file.id).html('<span class="upload_del_btn" data-filename="'+path+'" onclick="'+ "del_pic(this,true)" +'">删除</span><img src="' + all_path +'?x-oss-process=image/resize,m_fill,w_100,h_100"><input type="hidden" class="Js_upload_input" name="'+id.split('_')[0]+'[]" value="'+path+'">');
                    }else{
                        $('#'+file.id+'_canvas').remove();
                        upload_warp.prepend('<img data-filename="'+path+'" src="' + all_path +'?x-oss-process=image/resize,m_fill,w_100,h_100">').find('input.Js_upload_input').val(path);
                    }
                },
                Error: function(up, err) {
                    alert("抱歉！出错了：" + err.message);
                }
            }
        });
        //初始化上传
        uploader.init();
    }

    // 编辑器图片上传
    window.init_upload_edit = function(editor, token){
        var btnId = editor.imgMenuId;
        var containerId = editor.toolbarElemId;
        var textElemId = editor.textElemId;
        var container = $('<div style="height:0;width:0;display:none"></div>').appendTo('body');
        var uploader = new plupload.Uploader({
            runtimes : 'html5,flash,silverlight,html4',
            browse_button : btnId,//'pickfiles',
            container: container.get(0),//document.getElementById('container'),
            url : '/admin/upload_file',
            flash_swf_url : './plupload-2.1.2/Moxie.swf',
            silverlight_xap_url : './plupload-2.1.2/Moxie.xap',
            multi_selection: false,//false单选，true多选
            multipart_params: { '_token' : token },
            //过滤
            filters : {
                max_file_size : '10mb',
                mime_types: [
                    {title : "Image files", extensions : "jpg,jpeg,gif,png"}
                ]
            },
            init: {
                FilesAdded: function(up, files) {
                    var file = files[0];
                    editor.cmd.do('insertHtml', '<canvas id="'+file.id+'_canvas" width="90px" height="90px" style="margin-top: 5px;"></canvas>');
                    uploader.start();//选择文件后立即上传
                },
                BeforeUpload: function(up, file) {
                    file_ext = get_suffix(file.name); //后缀名
                    filename_new = Date.parse(new Date()) / 1000 + '_' + random_string(10) + file_ext;
                    set_upload_param(up, filename_new); //重设参数
                },
                UploadProgress: function(up, file) {
                    ringChart(file.id+'_canvas', file.percent);
                },
                FileUploaded: function(up, file, info) {
                    var path = key + filename_new;
                    var all_path = cdn_url + '/' + path;
                    $('#'+file.id+'_canvas').remove();
                    editor.cmd.do('insertHtml', '<img src="' + all_path + '" style="max-width:100%;"/>');
                },
                Error: function(up, err) {
                    alert("抱歉！出错了：" + err.message);
                }
            }
        });
        //初始化上传
        uploader.init();
    }
})();
