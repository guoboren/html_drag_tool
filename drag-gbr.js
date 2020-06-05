/**
 * 拖动插件       
 *     
 * @auther gbr
 * @version 1.0.0 -- 2018/2/8
 * @version 1.0.1 -- 2018/2/9
 */



/**
 ****************************************************************************************************************************************************************************************
 *****************************************************************************************构造函数****************************************************************************************
 ****************************************************************************************************************************************************************************************
 * @param {*} option 
 * 
 * 
 * 私有属性
 * _widgetCache
 * _width
 * _height
 * _canMove
 * _canResize
 * _option
 * 
 * 
 * 共有属性
 * container
 * draggable
 * resizable
 * 
 */
function GBRDrag(option) {
    /*私有属性*/
    this._canMove = false;//是否可以移动
    this._canResize = false;//是否可以缩放
    this._width;//容器的宽
    this._height;//容器的高
    this._widgetCache = []; //已有的组件缓存,保存组件属性的对象
    this._option; //当前配置
    this._isValid = true;//是否合法

    /*共有属性*/
    this.container;//容器选择器
    this.calculateType;//高度,宽度,x,y的计算方式(pixel | percent)
    this.draggable;//是否可拖动
    this.resizable;//是否可缩放


    //---------------------------------------初始化设置
    this._initSettings(option);
    //---------------------------------------初始化插件的事件功能
    this._moveWidget();//初始化拖动功能
    this._resizeWidget();//初始化缩放功能

}
/**************************************************************************************************************************************************************************************
 ***************************************************************************************私有方法****************************************************************************************
 **************************************************************************************************************************************************************************************
 */
/**
 * 组件缩放事件
 * @param {*} option
 */
GBRDrag.prototype._initSettings = function (option) {
    if (!!this._option) {
        option = $.extend(true, this._option, option);
    }
    //初始化配置对象
    this._option = option;
    //初始化容器元素
    this.container = !!option && !!option.container ? option.container : '';//容器选择器
    //检测合法性
    if (!this._checkGBRDragValid(this._option)) {
        this._option = null;
        return;
    }
    //初始化容器样式
    if (!$(this.container).hasClass('gbr-drag-stack')) {
        $(this.container).addClass('gbr-drag-stack');
    }
    //初始化计算方式
    this.calculateType = !!option && !!option.calculateType ? option.calculateType : 'percent';//容器选择器
    //初始化拖动，缩放
    this.draggable = !!option && !!option.draggable ? option.draggable : false;//是否可拖动
    this.resizable = !!option && !!option.resizable ? option.resizable : false;//是否可缩放
    //初始化容器宽高
    this._width = $(this.container).width();
    this._height = $(this.container).height();
    var thisObject = this;
    $(window).resize(function () {
        if ($(thisObject.container).width() <= thisObject._getCurrentWidgetMaxWidth() && $(thisObject.container).parent().width() <= thisObject._getCurrentWidgetMaxWidth()) {
            $(thisObject.container).css('width', thisObject._getCurrentWidgetMaxWidth());
        } else {
            $(thisObject.container).css('width', '100%');
        }
        if ($(thisObject.container).height() <= thisObject._getCurrentWidgetMaxHeight() && $(thisObject.container).parent().height() <= thisObject._getCurrentWidgetMaxHeight()) {
            $(thisObject.container).css('height', thisObject._getCurrentWidgetMaxHeight());
        } else {
            $(thisObject.container).css('height', '100%');
        }

        thisObject._width = $(thisObject.container).width();
        thisObject._height = $(thisObject.container).height();
        for (var i = 0; i < thisObject._widgetCache.length; i++) {
            var $item = $(thisObject.container).find('.gbr-drag-stack-item[gbr-id="' + thisObject._widgetCache[i].id + '"]');
            if (thisObject.calculateType == 'percent') {
                $item.css('width', $.accDiv(parseFloat($item.attr('gbr-width')) * thisObject._width, 100));
                $item.css('height', $.accDiv(parseFloat($item.attr('gbr-height')) * thisObject._height, 100));
            }
            if (thisObject.calculateType == 'pixel') {
                $item.css('width', parseFloat($item.attr('gbr-width')));
                $item.css('height', parseFloat($item.attr('gbr-height')));
            }
            //缩放时如果到了边缘则让其在边缘位置
            if ($item.position().left >= thisObject._width - $item.width()) {
                $item.css('left', thisObject._width - $item.width());
            }
            if ($item.position().left <= 0) {
                $item.css('left', 0);
            }
            if ($item.position().top >= thisObject._height - $item.height()) {
                $item.css('top', thisObject._height - $item.height());
            }
            if ($item.position().top <= 0) {
                $item.css('top', 0);
            }
        }
    });

    $(this.container).on('mouseover', '.gbr-drag-stack-item', function () {
        if (thisObject.resizable) {
            $(this).find('.gbr-drag-item-resize-handler').show();
        }
    });
    $(this.container).on('mouseout', '.gbr-drag-stack-item', function () {
        $(this).find('.gbr-drag-item-resize-handler').hide();
    });


    $(this.container).attr('GBRDrag-id', (new Date()).getTime());
    console.info('GBRDrag plugin is inited!');
};
/**
 * 获取当前组件中最大的宽度
 */
GBRDrag.prototype._getCurrentWidgetMaxWidth = function () {
    var max = 0;
    for (var i = 0; i < this._widgetCache.length; i++) {
        var $item = $(this.container).find('.gbr-drag-stack-item[gbr-id="' + this._widgetCache[i].id + '"]');
        if ($item.width() > max) max = $item.width();
    }
    return max;
};
/**
 * 获取当前组件中最大的高度
 */
GBRDrag.prototype._getCurrentWidgetMaxHeight = function () {
    var max = 0;
    for (var i = 0; i < this._widgetCache.length; i++) {
        var $item = $(this.container).find('.gbr-drag-stack-item[gbr-id="' + this._widgetCache[i].id + '"]');
        if ($item.height() > max) max = $item.height();
    }
    return max;
};

/** 
 * 初始化检测
 */
GBRDrag.prototype._checkGBRDragValid = function (option) {
    if (!!!option) {
        console.error('initial faild, can not get settings!');
        this._isValid = false;
        return false;
    }
    //检测是否合法
    if (option.container instanceof String && !option.container.startsWith('#')) {
        console.error('initial faild, container must starts with "#" and it must be "id" of a dom!');
        this._isValid = false;
        return false;
    }
    if ($(option.container).length == 0) {
        console.error('initial failed, can not find dom with container');
        this._isValid = false;
        return false;
    }
    return true;
};

/**
 * 组件缩放事件
 */
GBRDrag.prototype._resizeWidget = function () {
    var thisObject = this;
    var $targetWidget, $targetHandler;
    var startWidth, startHeight;
    var startX, startY;
    var resizeWidth, resizeHeight;
    var borderHorizontalWidth = 0, borderVerticalWidth = 0;
    $(this.container)[0].addEventListener('mousedown', function (e) {
        //检查是否可缩放
        if (!thisObject.resizable) {
            return;
        }
        $targetHandler = $(e.target);
        $targetWidget = $targetHandler.parents('.gbr-drag-stack-item');
        if ($targetWidget.hasClass('gbr-drag-stack-item') && $targetHandler.hasClass('gbr-drag-item-resize-handler') && $targetWidget.hasClass('gbr-drag-stack-item')) {
            thisObject._canMove = false;//禁止移动
            thisObject._canResize = true;
            startWidth = $targetWidget.outerWidth();
            startHeight = $targetWidget.outerHeight();
            startX = e.pageX;
            startY = e.pageY;
        }
    }, true);
    document.addEventListener('mousemove', function (e) {
        //检查是否可缩放
        if (!thisObject.resizable) {
            return;
        }
        if (thisObject._canResize) {
            resizeWidth = e.pageX - startX + startWidth;
            resizeHeight = e.pageY - startY + startHeight;
            $targetWidget
                .css('width', resizeWidth)
                .css('height', resizeHeight);
            //如果超出容器右边缘
            borderHorizontalWidth = parseInt($targetWidget.css('borderLeftWidth')) + parseInt($targetWidget.css('borderRightWidth'));
            borderVerticalWidth = parseInt($targetWidget.css('borderTopWidth')) + parseInt($targetWidget.css('borderBottomWidth'));
            if ($targetWidget.outerWidth() >= thisObject._width - $targetWidget.position().left - borderHorizontalWidth) {
                $targetWidget.css('width', thisObject._width - $targetWidget.position().left - borderHorizontalWidth);
            }
            //如果超过容器下边缘
            if ($targetWidget.outerHeight() >= thisObject._height - $targetWidget.position().top - borderVerticalWidth) {
                $targetWidget.css('height', thisObject._height - $targetWidget.position().top - borderVerticalWidth);
            }
            //绑定数据
            if (thisObject.calculateType == 'percent') {
                $targetWidget.attr('gbr-width', $.accDiv($targetWidget.width(), thisObject._width) * 100);
                $targetWidget.attr('gbr-height', $.accDiv($targetWidget.height(), thisObject._height) * 100);
            }
            if (thisObject.calculateType == 'pixel') {
                $targetWidget.attr('gbr-width', $targetWidget.width());
                $targetWidget.attr('gbr-height', $targetWidget.height());
            }
        }
    }, true);
    document.addEventListener('mouseup', function (e) {
        if (thisObject._canResize) {
            //检查是否可缩放
            if (!thisObject.resizable) {
                return;
            }
            startWidth = $targetWidget.width();
            startHeight = $targetWidget.height();
            thisObject._canResize = false;
            thisObject._updateWidgetInfo($targetWidget);
        }
    }, true);
};
/**
 * 组件移动事件
 */
GBRDrag.prototype._moveWidget = function () {
    var thisObject = this;
    var startPageX, startPageY;
    var moveX, moveY;
    var startX, startY;
    var $targetWidget;
    $(this.container)[0].addEventListener('mousedown', function (e) {
        if (!thisObject.draggable) {
            return;
        }
        $targetWidget = $(e.target).hasClass('gbr-drag-stack-item') ? $(e.target) : $(e.target).parents('.gbr-drag-stack-item');
        if (!$targetWidget.hasClass('gbr-drag-stack-item')) {
            return;
        }
        startPageX = e.pageX;
        startPageY = e.pageY;
        startX = $targetWidget.position().left;
        startY = $targetWidget.position().top;
        if ($targetWidget.parent()[0] == $(thisObject.container)[0] && !$(e.target).hasClass('gbr-drag-item-resize-handler')) {
            thisObject._canMove = true;
            thisObject._canResize = false;//进制缩放
        } else {
            thisObject._canMove = false;
        }
    });
    document.addEventListener('mousemove', function (e) {
        if (!thisObject.draggable) {
            return;
        }
        if (thisObject._canMove && !thisObject._canResize) {
            moveX = e.pageX - startPageX + startX;
            moveY = e.pageY - startPageY + startY;
            $targetWidget
                .css('left', moveX)
                .css('top', moveY);
            //如果触碰容器左边缘
            if ($targetWidget.position().left <= 0) {
                $targetWidget.css('left', 0);
            }
            //如果触碰容器右边缘
            if ($targetWidget.position().left >= thisObject._width - $targetWidget.outerWidth()) {
                $targetWidget.css('left', thisObject._width - $targetWidget.outerWidth());
            }
            //如果触碰容器上边缘
            if ($targetWidget.position().top <= 0) {
                $targetWidget.css('top', 0);
            }
            //如果触碰容器下边缘
            if ($targetWidget.position().top >= thisObject._height - $targetWidget.outerHeight()) {
                $targetWidget.css('top', thisObject._height - $targetWidget.outerHeight());
            }
            //绑定数据
            if (thisObject.calculateType == 'percent') {
                if ($.accDiv($targetWidget.position().left, thisObject._width - $targetWidget.outerWidth()) >= 0.9999) {
                    $targetWidget.attr('gbr-x', 100);
                } else {
                    $targetWidget.attr('gbr-x', $.accDiv($targetWidget.position().left, thisObject._width - $targetWidget.outerWidth()) * 100);
                }
                if ($.accDiv($targetWidget.position().top, thisObject._height - $targetWidget.outerHeight()) >= 0.9999) {
                    $targetWidget.attr('gbr-y', 100);
                } else {
                    $targetWidget.attr('gbr-y', $.accDiv($targetWidget.position().top, thisObject._height - $targetWidget.outerHeight()) * 100);
                }
            }
            if (thisObject.calculateType == 'pixel') {
                $targetWidget.attr('gbr-x', $targetWidget.position().left);
                $targetWidget.attr('gbr-y', $targetWidget.position().top);
            }
        }
    });
    document.addEventListener('mouseup', function () {
        if (thisObject._canMove) {
            if (!thisObject.draggable) {
                return;
            }
            startX = $targetWidget.position().left;
            startY = $targetWidget.position().top;
            thisObject._canMove = false;
            thisObject._updateWidgetInfo($targetWidget);
        }
    });
};
/**
 * 更新组件信息
 * @param {*} $widgetDom 
 */
GBRDrag.prototype._updateWidgetInfo = function ($widget) {
    if (!!!$widget) return;
    var cache = this._widgetCache;
    for (var i = 0; i < cache.length; i++) {
        var obj = cache[i];
        var id = obj.id;
        if (id == $widget.attr('gbr-id')) {
            obj.x = $widget.attr('gbr-x');
            obj.y = $widget.attr('gbr-y');
            obj.width = $widget.attr('gbr-width');
            obj.height = $widget.attr('gbr-height');
            break;
        }
    }
};
/**
 * 将新增的元素添加到维护的缓存中
 * @param {*} $widgetDom 
 */
GBRDrag.prototype._addWidgetToWidgetCache = function ($widgetDom) {
    var obj = {};
    obj.id = $widgetDom.attr('gbr-id');
    obj.x = $widgetDom.attr('gbr-x');
    obj.y = $widgetDom.attr('gbr-y');
    obj.width = $widgetDom.attr('gbr-width');
    obj.height = $widgetDom.attr('gbr-height');
    this._widgetCache.push(obj);
};
/**************************************************************************************************************************************************************************************
 ***************************************************************************************公有方法****************************************************************************************
 **************************************************************************************************************************************************************************************
 */
/**
 * 更新配置
 * @param {*} settings 
 */
GBRDrag.prototype.updateSettings = function (settings) {
    this._initSettings(settings);
}
/**
 * 打印组件信息缓存数组
 */
GBRDrag.prototype.getWidgetCache = function () {
    return this._widgetCache;
};
/**
 * 清空容器
 */
GBRDrag.prototype.clearGBRDrag = function () {
    for (var i = 0; i < this._widgetCache.length; i++) {
        var id = this._widgetCache[i].id;
        var $widget = $(this.container).find('.gbr-drag-stack-item[gbr-id="' + id + '"]').remove();
    }
    this._widgetCache.length = 0;
};
/**
 * 允许缩放
 */
GBRDrag.prototype.resizableOn = function () {
    if (this.resizable) return;
    this.resizable = true;
};
/**
 * 禁止缩放
 */
GBRDrag.prototype.resizableOff = function () {
    if (!this.resizable) return;
    this.resizable = false;
};
/**
 * 允许拖动
 */
GBRDrag.prototype.draggableOn = function () {
    if (this.draggable) return;
    this.draggable = true;
};
/**
 * 禁止拖动
 */
GBRDrag.prototype.draggableOff = function () {
    if (!this.draggable) return;
    this.draggable = false;
};
/**
 * 添加新的组件
 * @param {*} dom 
 * @param {*} x 
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 */
GBRDrag.prototype.addWidget = function (dom, x, y, width, height) {
    //检测合法性
    if (!this._isValid) {
        console.error('GBRDrag is not inited!');
        return;
    }
    var widgetX, widgetY, widgetWidth, widgetHeight, $widgetDom;
    //初始化组件dom元素
    if ($(dom).length == 0) {
        $widgetDom = $('<div class="gbr-drag-stack-item"><div class="gbr-drag-item-resize-handler"></div></div>')
    } else {
        $widgetDom = $(dom);
        if (!$widgetDom.hasClass('gbr-drag-stack-item')) {
            $widgetDom.addClass('gbr-drag-stack-item');
        }
        if (this.resizable) {
            $widgetDom.append($('<div class="gbr-drag-item-resize-handler"></div>'));
        }
    }
    //初始化组件属性
    if (x != undefined) { //x
        widgetX = x;
    } else {
        widgetX = 0;
    }
    if (y != undefined) {//y
        widgetY = y;
    } else {
        widgetY = 0;
    }
    if (width != undefined) {//width
        widgetWidth = width;
    } else {
        if (this.calculateType == 'pixel') {
            widgetWidth = 100;
        }
        if (this.calculateType == 'percent') {
            widgetWidth = 10;
        }
    }
    if (height != undefined) {//height
        widgetHeight = height;
    } else {
        if (this.calculateType == 'pixel') {
            widgetHeight = 100;
        }
        if (this.calculateType == 'percent') {
            widgetHeight = 10;
        }
    }
    //设置属性
    if (this.calculateType == 'pixel') {
        widgetWidth = widgetWidth;
        widgetHeight = widgetHeight;
        $widgetDom
            .css('position', 'absolute')
            .css('left', widgetX)
            .css('top', widgetY)
            .css('width', widgetWidth)
            .css('height', widgetHeight);
        $widgetDom.attr('gbr-id', (new Date()).getTime())
            .attr('gbr-x', widgetX)
            .attr('gbr-y', widgetY)
            .attr('gbr-width', widgetWidth)
            .attr('gbr-height', widgetHeight);
    }
    if (this.calculateType == 'percent') {
        var p_widgetWidth = $.accDiv((widgetWidth > 100 ? 100 : widgetWidth) * this._width, 100);
        var p_widgetHeight = $.accDiv((widgetHeight > 100 ? 100 : widgetHeight) * this._height, 100);
        var p_widgetX = $.accDiv((widgetX > 100 ? 100 : widgetX), 100) * (this._width - p_widgetWidth);
        var p_widgetY = $.accDiv((widgetY > 100 ? 100 : widgetY), 100) * (this._height - p_widgetHeight);
        $widgetDom
            .css('position', 'absolute')
            .css('left', p_widgetX)
            .css('top', p_widgetY)
            .css('width', p_widgetWidth)
            .css('height', p_widgetHeight);
        $widgetDom.attr('gbr-id', (new Date()).getTime())
            .attr('gbr-x', widgetX)
            .attr('gbr-y', widgetY)
            .attr('gbr-width', widgetWidth)
            .attr('gbr-height', widgetHeight);
    }

    //添加到容器中
    $widgetDom.appendTo($(this.container));
    //添加到维护的缓存中
    this._addWidgetToWidgetCache($widgetDom);
    return $widgetDom;
};







/**************************************************************************************************************************************************************************************
 ***************************************************************************************Jquery扩展方法****************************************************************************************
 **************************************************************************************************************************************************************************************
 */
$.extend({
    //除法
    accDiv: function (arg1, arg2) {
        if (arg1 == null || arg2 == null) return;
        var t1 = 0, t2 = 0, r1, r2;
        try {
            t1 = arg1.toString().split(".")[1].length;
        }
        catch (e) {
            
        }
        try {
            t2 = arg2.toString().split(".")[1].length;
        }
        catch (e) {
        }
        with (Math) {
            r1 = Number(arg1.toString().replace(".", ""));
            r2 = Number(arg2.toString().replace(".", ""));
            return (r1 / r2) * pow(10, t2 - t1);
        }
    }
});