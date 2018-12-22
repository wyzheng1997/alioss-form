<?php

namespace Airan\AliOssForm;

use Encore\Admin\Form\Field;

class File extends Field
{
    protected $view = 'alioss-form::file';
    protected static $css = [
        'vendor/airan/alioss-form/style.css',
    ];
    protected static $js = [
        'vendor/airan/alioss-form/plupload-2.1.2/js/plupload.full.min.js',
        'vendor/airan/alioss-form/upload.min.js',
    ];
    public function render()
    {
        $name = $this->formatName($this->column);
        $token = csrf_token();
        $this->script = <<<EOT
init_upload('{$name}_upload',false,'{$token}');
EOT;
        return parent::render();
    }
}