function openWin(a) {
    var title = $(a).attr('data-title');
    var url = $(a).attr('data-url');
    var base = $(a).attr('data-base');
    var name = $(a).attr('data-name');
    try {
        if (!title && !url && !base && !name) {
            title = a.title;
            url = a.url;
            base = a.base;
            name = a.name;
        }
    } catch (e) {}
    if (!url) return false;
    if (!name) name = url;
    if (!title) title = '';
    if (/^http(|s):\/\//.test(url)) {
        name = 'http';
        if (!base) {
            base = 'header_http.html';
        }
    }
    if (!base) base = 'header_top.html';
    try {
        if (typeof(JSON.parse(name)) == 'object') {
            name = 'frameGroup';
        }
    } catch (e) {}

    api.openWin({
        name: name,
        url: 'widget://' + base,
        slidBackType: 'edge', //在页面左边缘右滑才可以返回(ios)
        bounces: false, //页面不允许弹动
        pageParam: {
            url: url,
            title: title
        }
    });
}

//加载内容
function loadData(url, success, load, count) {
    if (!count) count = 1;
    if (!/^http(|s):\/\//.test(url)) {
        url = _G.http + url;
    }
    if (count == 1) {
        $('body').append('<div class="S_loading JA_loading"></div>');
    }
    console.log('请求接口:' + url);
    api.ajax({
        url: url,
        method: 'get'
    }, function(ret, err) {
        if (count == 1) {
            $('.JA_loading').remove();
            loadingPage(url, success, load); //初始化下拉刷新
            if (load) {
                loadingData(url, success, load); //初始化上拉加载
            }
        }
        if (ret) {
            if (count == 3) {
                $('.JA_loading_list').remove();
                if (ret.data && ret.data.length == 0) {
                    $('body').append('<div class="JA_loading_list_over S_loading-list-over">没有更多数据了</div>');
                } else {
                    load(ret);
                }
            } else {
                if (count == 2) {
                    success(ret, 1);
                } else {
                    success(ret);
                }
            }
        } else {
            $('body').html('<div class="S_gateway-error" tapmode onclick="javascript:window.location.href=window.location.href"><a href="javascript:;">' + err.msg + '<br/>点击重新载入</a></div>');
            api.parseTapmode();
        }
        if (count == 2) {
            $('body').attr('data-page', '1');
            api.refreshHeaderLoadDone();
        }
    });
}
// 上拉继续加载第二页
function loadingData(url, success, load) {
    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 200 //设置距离底部多少距离时触发，默认值为0，数字类型
        }
    }, function(ret, err) {
        if ($('.JA_loading_list').length != 0) {
            return false;
        }
        if (!$('body').attr('data-page')) {
            page = 1;
        } else {
            page = $('body').attr('data-page');
        }
        $('body').append('<div class="JA_loading_list S_loading-list">加载中...</div>');
        //判断url
        page++;
        if (/page=([\d]+)$/.test(url)) {
            url = url.replace(/page=([\d]+)$/, "page=" + page);
        } else {
            if (/\?/.test(url)) {
                url = url + '&page=' + page;
            } else {
                url = url + '?page=' + page;
            }
        }
        $('body').attr('data-page', page);
        loadData(url, success, load, 3);
    });
}
//下拉刷新
function loadingPage(url, success, load) {
    api.setRefreshHeaderInfo({
        bgColor: '#f5f5f5',
        textColor: '#ccc',
        textDown: '下拉刷新...',
        textUp: '松开加载...'
    }, function(ret, err) {
        setTimeout(function() {
            loadData(url, success, load, 2);
        }, 500);
    });
}

function get(name) {
    var href = window.location.href.match(/(\?|&)([\w]+)=([^&]*)/g);
    for (var i in href) {
        href[i] = href[i].replace(/^(\?|&)/, '');
        var vals = href[i].split('=');
        if (name == vals[0]) {
            return vals[1];
        }
    }
    return '';
}
