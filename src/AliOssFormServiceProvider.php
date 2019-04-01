<?php

namespace Airan\AliOssForm;

use Encore\Admin\Admin;
use Encore\Admin\Form;
use Illuminate\Support\ServiceProvider;

class AliOssFormServiceProvider extends ServiceProvider
{
    /**
     * {@inheritdoc}
     */
    public function boot(AliOssForm $extension)
    {
        if (! AliOssForm::boot()) {
            return ;
        }

        if ($views = $extension->views()) {
            $this->loadViewsFrom($views, 'alioss-form');
        }

        if ($this->app->runningInConsole() && $assets = $extension->assets()) {
            $this->publishes(
                [$assets => public_path('vendor/airan/alioss-form')],
                'alioss-form'
            );
        }

        Admin::booting(function () {
            Form::extend('file', File::class);
//             Form::extend('image', Image::class);
//             Form::extend('editor', Editor::class);
        });


        $this->app->booted(function () {
            AliOssForm::routes(__DIR__.'/../routes/web.php');
        });
    }
}
