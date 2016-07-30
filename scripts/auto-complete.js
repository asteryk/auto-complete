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
 * 穿参格式[{'163':['111222','1111333']},{'mail':['222222','222333']}]
 * url优先于data
 */
(function($) {
    // ajax
    function getFromUrl($inputEle, config, $autoComplete) {
        var currentInput = String($inputEle.val());
        $.ajax({
            type: "POST",
            url: config.url,
            data: { keyword: currentInput },
            dataType: "json",
            success: function(data) {
                resultShow(data, $autoComplete);
            },
            error: function() {
                console.log('获取补全信息失败');
            }
        });
    }

    function getFromLocal(inputText, data, $autoComplete) {
        if (data == null || data.length <= 0) {
            return;
        }
        var flag = false;
        for (var i = 0; i < data.length; i++) {
            for (var key in data[i]) {
                if (inputText === String(key)) {
                    resultShow(data[i][key], $autoComplete);
                    flag = true;
                }
            }
        }
        if (flag) {
            flag = false;
        } else {
            $autoComplete.hide();
        }

    }
    // 显示下拉补全
    function resultShow(data, $autoComplete) {
        // [data]'s type array
        if (data == null || data.length <= 0) {
            return;
        }
        var tableBody = '<div class="js-autotable">';;
        for (var ii = 0; ii < data.length; ii++) {
            tableBody += '<div class="js-autorow">' + data[ii] + '</div>'
        }
        tableBody += '</div>';
        $autoComplete.html(tableBody);
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
                var $next = $('.js-autocomplete-selected');

                if ($next.length <= 0) { //没有选中行时，选中第一行
                    $next = $('div.js-autorow:first').addClass('js-autocomplete-selected');
                    $autoComplete.scrollTop(0);
                } else {
                    $next.removeClass('js-autocomplete-selected');
                    $next = $next.next().addClass('js-autocomplete-selected');
                }
                $('div.js-autorow').removeClass('js-autocomplete-selected');

                if ($next.length > 0) { //有下一行时（不是最后一行）
                    $next.addClass("js-autocomplete-selected"); //选中的行加背景
                    $inputEle.val($next.text()); //选中行内容设置到输入框中
                    scrollHeight($autoComplete, $inputEle, $next, 'down');
                } else {
                    $inputEle.val(inputText); //输入框显示用户原始输入的值
                }
                break;
            case 38: //向上键
                var $previous = $('.js-autocomplete-selected');
                if ($previous.length <= 0) { //没有选中行时，选中最后一行行
                    $previous = $autoComplete.find('div.js-autorow:last');
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
                data: null
                    // 穿参格式[{key:'',value:''}]
                    // url优先于data
            };
            $.extend(config, params);
            var functionalKeyArray = [40, 38, 13, 27];
            //键盘上功能键键值数组
            // 补全框设定

            var $autoComplete = $('<div class="js-autocomplete-area"></div>');
            $(document.body).append($autoComplete);
            $autoComplete.css({
                'width': inputWidth - 2,
                'top': inputHeight + inputTop,
                'left': inputLeft
            });
            // 适配IE8
            $inputEle.on('input propertychange', function() {
                var currentInput = String($inputEle.val());
                if (config.url) {
                    getFromUrl($inputEle, config, $autoComplete);
                } else {
                    getFromLocal(currentInput, config.data, $autoComplete);
                }
            });
            var isFunctionalKey = false; //按下的键是否是功能键
            $inputEle.on('keyup', function(event) {
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
            $autoComplete.on('mouseover', function(event) {
                if (isFunctionalKey) {
                    isFunctionalKey = false;
                } else {
                    $inputEle.focus();
                    $('div').removeClass('js-autocomplete-selected');
                    $tr = $(event.target)
                    $tr.addClass('js-autocomplete-selected');
                }


            });
            $autoComplete.on('click', function(event) {
                if (isFunctionalKey) {
                    isFunctionalKey = false;
                } else {
                    $tr = $(event.target);
                    $inputEle.val($tr.text());
                    $autoComplete.hide();
                }
            });
        }
    });

})(jQuery)