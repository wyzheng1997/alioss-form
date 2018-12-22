laravel-admin extension
======
扩展laravel-admin,web直传阿里OSS（file，image，editor）

### 安装
```
composer require airan/alioss-form
php artisan vendor:publish --tag=alioss-form
```
### 配置
新建配置文件config/alioss.php
```
<?php
return [
    'OSS_ACCESS_ID' => '0I********Dx',
    'OSS_ACCESS_KEY' => 'N*******************NT',
    'OSS_ENDPOINT' => 'oss-cn-*****.aliyuncs.com',
    'OSS_BUCKET' => '*******',
    'OSS_HOST' => 'http://******.oss-cn-****.aliyuncs.com',
    //前台显示域名
    'OSS_URL' => 'http://********.oss-cn-*****.aliyuncs.com'
];
```

### 使用
```
$form->file('pic', '单图');
$form->image('images', '多图');
$form->editor('content', '编辑器');
```

### 截图
![]

