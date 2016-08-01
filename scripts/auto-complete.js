/**
 * 自动补全输入
 * 2016/7/29
 * author:asteryk
 * @param 
 * autocomplete:BOOLEN,
 	可选,是否开启鼠标移动方向键移动自动补全
 * url: STRING,
	可选,ajax的url地址
 * data: OBJECT,
    穿参格式[{
                key: "1",
                val: "overwatchmaster"
            }, {
                key: "2",
                val: "overwatch wiki"
            }]
    url优先于data
 * keyname: STRING,
    传参的第一个参数的keyname
 * valuename: STRING,
    传参的第二个参数keyname
 * callback: FUNCTION
    回调函数，返回选中的对象
    格式{key:,value:}
 */
(function($) {
    /*
        数据处理方法  
    */
    // 数据来源分类
    function filterData(currentInput, config, $autoComplete) {
        var defer = $.Deferred();
        if (config.url) {
            config.keyname = 'key';
            config.valuename = 'word';
            $.ajax({
                type: "POST",
                url: config.url,
                data: { keyword: currentInput },
                dataType: "json",
                success: function(data) {
                    defer.resolve(associateData(currentInput, data, config.valuename));
                },
                error: function() {
                    console.log('获取补全信息失败');
                }
            });
        } else {
            defer.resolve(associateData(currentInput, config.data, config.valuename));
        };
        return defer;
    }
    // 数据联想模块
    function associateData(keyword, data, valueName) {
        var list = [];
        if (keyword == null || keyword == "") {
            return;
        }
        if (data != null && $.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                if (data[i][valueName].indexOf(keyword) > -1) {
                    list.push(data[i]);
                }
            }
        }
        return list;
    }
    // 回调
    function callbackConstruct(config, $autoComplete) {
        var $choose = $autoComplete.find('.js-autocomplete-selected');
        if ($choose.length <= 0) return;
        var item = {
            'key': $choose.attr('item-key'),
            'value': $choose.text()
        }
        config.callback(item);
        $autoComplete.hide();
    }
    // 自动补全
    function autoCompleteContent($inputEle, content, flag) {
        if (flag) {
            $inputEle.val(content);
        }
    }
    /*
       页面DOM方法  
    */
    // 显示下拉补全
    function resultShow(data, $autoComplete, config) {
        // [data]'s type array
        if (data == null || data.length <= 0) {
            return;
        }
        var container = '<div class="js-autocontainer">';;
        for (var ii = 0; ii < data.length; ii++) {
            container += '<div class="js-autorow" item-key="' + data[ii][config.keyname] + '">' + data[ii][config.valuename] + '</div>'
        }
        container += '</div>';
        $autoComplete.html(container);
        $autoComplete.show();
    }
    // 滚动条
    function scrollHeight($outer, $input, $select, direction) {

        var inputPosition = $input.offset().top + $input.height();
        var selectPosition = $select.offset().top - inputPosition + $select.height();
        var scrollTimes = Math.floor($outer[0].scrollHeight / $outer.height());
        if (direction === 'down') {
            if (selectPosition > $outer.height()) {

                $outer.scrollTop($outer[0].scrollTop + $select.height() * scrollTimes);
            }
        } else {
            if (selectPosition < 0) {

                $outer.scrollTop($outer[0].scrollTop - $select.height() * scrollTimes);
            }
        }

    }
    // 功能键作用
    function functionKeyUse($inputEle, inputText, $autoComplete, config) {
        if ($autoComplete.is(':hidden')) return;

        switch (event.keyCode) {
            case 40: //向下键
                var $next = $autoComplete.find('.js-autocomplete-selected');

                if ($next.length <= 0) { //没有选中行时，选中第一行
                    $next = $autoComplete.find('.js-autorow:first');
                    $autoComplete.scrollTop(0);
                } else {
                    $next = $next.next();
                }
                $('.js-autorow').removeClass('js-autocomplete-selected');

                if ($next.length > 0) { //有下一行时（不是最后一行）
                    $next.addClass("js-autocomplete-selected"); //选中的行加背景
                    autoCompleteContent($inputEle, $next.text(), config.autocomplete); //选中行内容设置到输入框中
                    scrollHeight($autoComplete, $inputEle, $next, 'down');
                } else {
                    $inputEle.val(inputText); //输入框显示用户原始输入的值
                }
                break;
            case 38: //向上键
                var $previous = $autoComplete.find('.js-autocomplete-selected');
                if ($previous.length <= 0) { //没有选中行时，选中最后一行行
                    $previous = $autoComplete.find('.js-autorow:last');
                    $autoComplete.scrollTop($autoComplete[0].scrollHeight);
                } else {
                    $previous = $previous.prev();
                }
                $('.js-autorow').removeClass('js-autocomplete-selected');

                if ($previous.length > 0) { //有上一行时（不是第一行）
                    $previous.addClass("js-autocomplete-selected"); //选中的行加背景
                    autoCompleteContent($inputEle, $previous.text(), config.autocomplete); //选中行内容设置到输入框中
                    scrollHeight($autoComplete, $inputEle, $previous, 'up');
                } else {
                    $inputEle.val(inputText); //输入框显示用户原始输入的值
                }
                break;
            case 13: //回车隐藏下拉框
                var $choose = $autoComplete.find('.js-autocomplete-selected');
                autoCompleteContent($inputEle, $choose.text(), !config.autocomplete); //选中行内容设置到输入框中
                callbackConstruct(config, $autoComplete);
            case 27: //ESC键隐藏下拉框
                $autoComplete.hide();
                break;
        }
    }
    $.fn.extend({
        autoComplete: function(params) {
            // 设置补足框位置
            var $inputEle = $(this);
            var inputWidth = $inputEle.outerWidth();
            var inputHeight = $inputEle.outerHeight();
            var inputTop = $inputEle.offset().top;
            var inputLeft = $inputEle.offset().left;
            // 配置参数
            var config = {
                autocomplete: true,
                // 可选，是否开启鼠标移动方向键移动自动补全
                url: null,
                // 可选,ajax的method
                data: null,
                // 穿参格式[
                //     { "key": "1", "word": "守望先锋" },
                //     { "key": "2", "word": "守望先锋配置" }
                // ]
                // url优先于data
                keyname: 'key',
                valuename: 'value',
                callback: null
            };
            $.extend(config, params);

            //键盘上功能键键值数组
            var functionalKeyArray = [40, 38, 13, 27];

            // 补全框设定
            var $autoComplete = $('<div class="js-autocomplete-area"></div>');
            $(document.body).append($autoComplete);
            $autoComplete.css({
                'width': inputWidth - 2,
                'top': inputHeight + inputTop,
                'left': inputLeft
            });

            // 输入框事件，适配IE8
            $inputEle.on('input propertychange', function() {
                var currentInput = String($inputEle.val());
                $autoComplete.hide();
                filterData(currentInput, config, $autoComplete).then(function(list) {
                    resultShow(list, $autoComplete, config);
                }, function(params) {
                    console.log(params);
                });
            });
            //按下的键是否是功能键
            var isFunctionalKey = false;
            $inputEle.on('keyup', function(event) {
                event.preventDefault();
                var currentInput = String($inputEle.val());
                var keyCode = event.keyCode;
                for (var i = 0; i < functionalKeyArray.length; i++) {
                    if (keyCode == functionalKeyArray[i]) {
                        isFunctionalKey = true;
                        break;
                    }
                }
                if (isFunctionalKey) {
                    functionKeyUse($inputEle, currentInput, $autoComplete, config);
                }

            })

            // 鼠标事件
            $autoComplete.on('mouseover', '.js-autorow', function() {
                if (isFunctionalKey) {
                    isFunctionalKey = false;
                } else {
                    $inputEle.focus();
                    $('.js-autorow').removeClass('js-autocomplete-selected');
                    $autoCompleteRow = $(this);
                    autoCompleteContent($inputEle, $autoCompleteRow.text(), config.autocomplete);
                    $autoCompleteRow.addClass('js-autocomplete-selected');
                }


            });
            // 点击事件，排除输入框，在空白处点击可以选中
            $(document).on('mousedown.autocomplete', function(event) {
                if (!$autoComplete.is(':hidden') && event.target.tagName != 'INPUT') {
                    $autoCompleteRow = $(this).find('.js-autocomplete-selected');
                    autoCompleteContent($inputEle, $autoCompleteRow.text(), !config.autocomplete);
                    callbackConstruct(config, $autoComplete);
                }
            });
            // 销毁函数
            $inputEle.destory = function() {
                $(document).off('mousedown.autocomplete');
                $autoComplete.off('mouseover');
                $inputEle.off('input propertychange keyup');
                $inputEle.remove();
                $autoComplete.remove();
            };
        }

    });

})(jQuery || $);