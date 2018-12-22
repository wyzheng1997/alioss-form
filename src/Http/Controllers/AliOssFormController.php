<?php

namespace Airan\AliOssForm\Http\Controllers;

use Encore\Admin\Layout\Content;
use Illuminate\Routing\Controller;

class AliOssFormController extends Controller
{
    public function getAliOssParam()
    {
        $config = config('alioss');
        $id= $config['OSS_ACCESS_ID'];          // 请填写您的AccessKeyId。
        $key= $config['OSS_ACCESS_KEY'];     // 请填写您的AccessKeySecret。
        // $host的格式为 bucketname.endpoint，请替换为您的真实信息。
        $host = $config['OSS_HOST'];
        // CDN 前端显示URL
        $cdn_url = $config['OSS_URL'];

        $dir = 'file/'.date('Ym').'/'.date('d');          // 用户上传文件时指定的前缀。 file/201812/01

        $now = time();
        $expire = 300;  //设置该policy超时时间是300s. 即这个policy过了这个有效时间，将不能访问。
        $end = $now + $expire;
        $expiration = $this->gmt_iso8601($end);


        //最大文件大小.用户可以自己设置
        $condition = array(0=>'content-length-range', 1=>0, 2=>1048576000);
        $conditions[] = $condition;

        // 表示用户上传的数据，必须是以$dir开始，不然上传会失败，这一步不是必须项，只是为了安全起见，防止用户通过policy上传到别人的目录。
        $start = array(0=>'starts-with', 1=>'$key', 2=>$dir);
        $conditions[] = $start;

        $arr = array('expiration'=>$expiration,'conditions'=>$conditions);
        $policy = json_encode($arr);
        $base64_policy = base64_encode($policy);
        $string_to_sign = $base64_policy;
        $signature = base64_encode(hash_hmac('sha1', $string_to_sign, $key, true));

        $response = array();
        $response['accessid'] = $id;
        $response['host'] = $host;
        $response['cdn_url'] = $cdn_url;
        $response['policy'] = $base64_policy;
        $response['signature'] = $signature;
        $response['expire'] = $end;
        $response['dir'] = $dir;  // 这个参数是设置用户上传文件时指定的前缀。
        return $response;
    }


    /**
     * gmt时间格式转换
     */
    public function gmt_iso8601( $time ) {
        $dtStr = date( "c", $time );
        $mydatetime = new \DateTime( $dtStr );
        $expiration = $mydatetime->format( \DateTime::ISO8601 );
        $pos = strpos( $expiration, '+' );
        $expiration = substr( $expiration, 0, $pos );
        return $expiration."Z";
    }
}