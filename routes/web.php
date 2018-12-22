<?php

use Airan\AliOssForm\Http\Controllers\AliOssFormController;

Route::get('alioss_param', AliOssFormController::class.'@getAliOssParam');