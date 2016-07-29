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
 * 穿参格式[{title:11111,result:['111222','1111333']},{title:222222,result:['222222','222333']}]
 * url优先于data
 */
(function($) {
    // ajax
    function getFromUrl(inputForm, config, $auto) {
        var currentInput = String(inputForm.val());
        $.ajax({
            type: "POST",
            url: config.url,
            data: '111',
            dataType: "json",
            success: function(data) {
                resultShow(data, $auto);
            }
        });
    }

    function localData(inputText, data, $auto) {
        if (data == null || data.length <= 0) {
            return;
        }
        for (var i = 0; i < data.length; i++) {

            if (inputText === String(data[i].title)) {
                resultShow(data[i].result, $auto);
                break;
            } else {
                $auto.hide();
            }
        }
    }
    // 显示下拉补全
    function resultShow(data, $auto) {
        // data is array required
        if (data == null || data.length <= 0) {
            return;
        }
        var tableBody = '<div class="m-autotable">';;
        for (var ii = 0; ii < data.length; ii++) {
            tableBody += '<div class="u-autorow">' + data[ii] + '</div>'
        }
        tableBody += '</div>';
        $auto.append(tableBody);
        $auto.show();
    }
    // 功能键作用
    function functionKeyUse(inputForm, inputText, $auto) {
        if ($auto.is(':hidden')) return;
        $auto.unbind('mouseover');
        switch (event.keyCode) {
            case 40: //向下键
                var $next = $('.u-autocomplete-selected');

                if ($next.length <= 0) { //没有选中行时，选中第一行
                    $next = $('div.u-autorow:first').addClass('u-autocomplete-selected');
                } else {
                    $next.removeClass('u-autocomplete-selected');
                    $next = $next.next().addClass('u-autocomplete-selected');
                }
                $('div.u-autorow').removeClass('u-autocomplete-selected');

                if ($next.length > 0) { //有下一行时（不是最后一行）
                    $next.addClass("u-autocomplete-selected"); //选中的行加背景
                    inputForm.val($next.text()); //选中行内容设置到输入框中
                    $auto.scrollTop($next.offset().top - $auto.height() + $next.height());

                } else {
                    inputForm.val(inputText); //输入框显示用户原始输入的值
                }
                break;
            case 38: //向上键
                var $previous = $('.u-autocomplete-selected');
                console.log($previous.prev().text());
                if ($previous.length <= 0) { //没有选中行时，选中最后一行行
                    $previous = $auto.find('div.u-autorow:last');
                } else {
                    $previous = $previous.prev();
                }
                $('div.u-autorow').removeClass('u-autocomplete-selected');

                if ($previous.length > 0) { //有上一行时（不是第一行）
                    $previous.addClass("u-autocomplete-selected"); //选中的行加背景
                    inputForm.val($previous.text()); //选中行内容设置到输入框中
                    $auto.scrollTop($previous.offset().top - $auto.height() + $previous.height());
                } else {
                    inputForm.val(inputText); //输入框显示用户原始输入的值
                }
                break;
            case 13: //回车隐藏下拉框
            case 27: //ESC键隐藏下拉框
                $auto.hide();
                break;
        }
    }
    $.fn.extend({
        autoComplete: function(params) {
            // 设置补足框位置
            var inputForm = $(this);
            var inputWidth = inputForm.outerWidth();
            var inputHeight = inputForm.outerHeight();
            var inputTop = inputForm.offset().top;
            var inputLeft = inputForm.offset().left;
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

            var $auto = $('<div class="m-autocomplete-area"></div>');
            $(document.body).append($auto);
            $auto.css({
                'width': inputWidth - 2,
                'top': inputHeight + inputTop,
                'left': inputLeft
            });

            inputForm.on('input', function() {
                var currentInput = String(inputForm.val());
                if (config.url) {
                    getFromUrl(inputForm, config, $auto);
                } else {
                    localData(currentInput, config.data, $auto);
                }
            })
            inputForm.on('keyup', function(event) {
                var currentInput = String(inputForm.val());
                var keyCode = event.keyCode;
                var isFunctionalKey = false; //按下的键是否是功能键
                for (var i = 0; i < functionalKeyArray.length; i++) {
                    if (keyCode == functionalKeyArray[i]) {
                        isFunctionalKey = true;
                        break;
                    }
                }
                if (!isFunctionalKey) {} else {
                    functionKeyUse(inputForm, currentInput, $auto);
                }
            })
            $auto.on('mouseover', function(event) {
                console.log('over');
                inputForm.focus();
                $('div').removeClass('u-autocomplete-selected');
                $tr = $(event.target)
                $tr.addClass('u-autocomplete-selected');
            });
            $auto.on('click', function(event) {
                $tr = $(event.target);
                inputForm.val($tr.text());
                $auto.hide();
            });
        }
    });

})(jQuery)