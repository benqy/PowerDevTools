(function (global) {

  global.send = function (type, obj) {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ type: type, obj: obj });
    }
  };

  global.log = function (obj) {
    send('log', obj);
  };


  var loadingTimer = null, loadend = false,
    //数据传输总时间(即页面开始加载到最后一个请求完成的时间);
    transferTime;
  var checkTime = 5000;




  var speedTesting = {
    datas:[],
    init: function () {
      this.datas = [];
      this.urls = [];
      this.bindAction();
    },
    bindAction: function () {
      $('#startTesting').on('click', function () {
        speedTesting.start();
      });
    },
    start: function () {
      log('Start');
      this.stop();
      chrome.devtools.network.onRequestFinished.addListener(this.onRequestFinished);
      chrome.devtools.network.onNavigated.addListener(this.onNavigated);
      this.urls = $.trim($('#urls').val()).split("\n");
      this.next();
    },
    onRequestFinished: function () {
      speedTesting.getHAR.call(speedTesting);
    },
    onNavigated: function (a) {
      loadend = false;
      transferTime = Date.now();
      speedTesting.getHAR.call(speedTesting);
    },
    next: function () {
      if (this.urls.length) {
        var url = this.urls.shift();
        send('start_speed_testing', { url: url, tabId: chrome.devtools.inspectedWindow.tabId });
      }
      else {
        this.stop();
        this.report();
      }
    },
    //5s之内没有任何页面请求之后,获取har
    getHAR: function () {
      var me = this;
      clearTimeout(loadingTimer);
      loadingTimer = setTimeout(function () {
        //同一个页面只计算一次,防止后续异步加载的请求导致重新获取HAR
        if (!loadend) {
          loadend = true;
          transferTime = Date.now() - transferTime - checkTime;
          chrome.devtools.network.getHAR(function (harObj) {
            var harParser = new HARParser(harObj);
            //计算实际总传输时间(即开始请求页面到最后一个请求结束)
            harParser.timings.transferTime = transferTime;
            me.datas.push(harParser);            
            me.next();
          });
        }
      }, checkTime);
    },
    stop: function () {
      chrome.devtools.network.onRequestFinished.removeListener(this.onRequestFinished);
      chrome.devtools.network.onNavigated.removeListener(this.onNavigated);
    },
    report: function () {
      log(this.datas);
      log('Finished');
      $('#d2').text(this.datas[0].timings.onContentLoad);
      $('#d3').text(this.datas[1].timings.onContentLoad);
    }
  };

  speedTesting.init();
})(this)