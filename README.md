# QLScript

脚本介绍:

1.jd_CheckCK.js

自动检测账号是否正常，不正常的自动禁用，正常的如果是禁用状态则自动启用.

Update : 20210903

增加变量显示正常CK:  export SHOWSUCCESSCK="true"

增加变量永远通知CK状态:  export CKALWAYSNOTIFY="true"

增加变量停用自动启用CK:  export CKAUTOENABLE="false"

增加变量不显示CK备注:  export CKREMARK="false"

2.ql.js 是jd_CheckCK.js的依赖,一起放在Scripts里面

3.jd_bean_change.js

自用的京东资产变动查询加强版

Update : 20210903

增加领现金金额显示.

4.sendNotify.js (没有Ninjia会报错，别用)

增加了NOTIFY_GROUP_LIST，如果通知标题在此变量里面(&隔开),则使用 QYWX_AM2 跟 PUSH_PLUS_USER2 变量替换QYWX_AM 跟 PUSH_PLUS_USER 以达到通知不通的群组.

其他功能待修改.

青龙拉库命令(不包含sendNotify.js):

ql repo https://github.com/ccwav/QLScript.git "jd_" "sendNotify.js" "ql.js"
