###基于jq的自动补全插件

> gulp serve

> gulp build

###使用方法

* @param       
* url: STRING,

>	可选,ajax的url地址
 
* data: OBJECT,

````````````````````````````
    穿参格式[{
                key: "1",
                val: "overwatchmaster"
            }, {
                key: "2",
                val: "overwatch wiki"
            }]
````````````````````````````
    
> url优先于data

* keyname: STRING,

> 传参的第一个参数的keyname

* valuename: STRING,

> 传参的第二个参数keyname

* callback: FUNCTION

````````````````````````````
    回调函数，返回选中的对象
    格式{key:,value:}
````````````````````````````
 