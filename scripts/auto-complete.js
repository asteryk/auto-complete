/**
 * 自动补全输入
 * 2016/7/29
 * author:asteryk
 * @param       
 * url: null,
 * 可选,ajax的url地址
 * ajaxMethod: 'GET',
 * 可选,ajax的method,默认GET
 * data: null
 * 穿参格式[{'id':'1',name:'sweetyx'},{'id':'2',name:'lyk'}]
 * url优先于data
 */
(function($) {
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
    function callbackStack(config, item) {
        var callbakFunc = config.callback;
        callbakFunc(item);
    }
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
    function functionKeyUse($inputEle, inputText, $autoComplete) {
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
                    $inputEle.val($next.text()); //选中行内容设置到输入框中
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
                $('div.js-autorow').removeClass('js-autocomplete-selected');

                if ($previous.length > 0) { //有上一行时（不是第一行）
                    $previous.addClass("js-autocomplete-selected"); //选中的行加背景
                    $inputEle.val($previous.text()); //选中行内容设置到输入框中
                    scrollHeight($autoComplete, $inputEle, $previous, 'up');
                } else {
                    $inputEle.val(inputText); //输入框显示用户原始输入的值
                }
                break;
            case 13: //回车隐藏下拉框
                var $choose = $autoComplete.find('.js-autocomplete-selected');
                var item = {
                    'hisKey': $choose.attr('item-key'),
                    'hisVal': $choose.text()
                }
                callbackStack($choose);
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
                url: null,
                // 可选,ajax的method
                data: null,
                // 穿参格式[{'163':['111222','1111333']},{'mail':['222222','222333']}]
                // url优先于data
                keyname: 'key',
                valuename: 'value',
                callback: function(res) {}
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
                    console.log(list);
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
                    functionKeyUse($inputEle, currentInput, $autoComplete);
                }

            })

            // 鼠标事件
            $autoComplete.on('mouseover', 'div.js-autorow', function() {
                if (isFunctionalKey) {
                    isFunctionalKey = false;
                } else {
                    $inputEle.focus();
                    $('div').removeClass('js-autocomplete-selected');
                    $autoCompleteRow = $(this)
                    $autoCompleteRow.addClass('js-autocomplete-selected');
                }


            });
            $autoComplete.on('click', 'div.js-autorow', function() {
                if (isFunctionalKey) {
                    isFunctionalKey = false;
                } else {
                    $autoCompleteRow = $(this);
                    $inputEle.val($autoCompleteRow.text());
                    $autoComplete.hide();
                }
            });
        }
    });

})(jQuery || $);