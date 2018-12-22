<?php

namespace Airan\AliOssForm;

use Encore\Admin\Form\Field;

class Editor extends Field
{
    protected $view = 'alioss-form::editor';
    protected static $css = [
        'vendor/airan/alioss-form/wangEditor-3.0.10/release/wangEditor.min.css',
    ];
    protected static $js = [
        'vendor/airan/alioss-form/wangEditor-3.0.10/release/wangEditor.min.js',
        'vendor/airan/alioss-form/upload.min.js',
    ];
    public function render()
    {
        $name = $this->formatName($this->column);
        $token = csrf_token();
        $this->script = <<<EOT
(function(){
var editor = new window.wangEditor('#$name');
editor.customConfig.zIndex = 0;
editor.customConfig.uploadImgShowBase64 = true;
editor.customConfig.qiniu = true;
editor.customConfig.onchange = function (html) {
    $('input[name="$name"]').val(html);
}
editor.create();
init_upload_edit(editor, '$token')
})();
EOT;
        return parent::render();
    }
}