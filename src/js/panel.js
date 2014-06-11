(function (global) {
  //初始化时刷新页面,以加载content.js
  chrome.devtools.inspectedWindow.reload();

  global.send = function (type, obj) {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ type: type, obj: obj });
    }
  };



  global.log = function (obj) {
    send('log', obj);
  };

  global.logToPanel = function (text) {
    $('#log').append('<span>[' + new Date().toString() + ']:' + text + '</span>');
  };

  global.clearLog = function () {
    $('#log').html('');
  };
  //毫秒转为秒显示,并保留3位小数
  global.msToSec = function (time, fixed) {
    fixed = fixed || 3;
    return (time / 1000).toFixed(fixed);
  };

  global.byteToKB = function (size, fixed) {
    fixed = fixed || 3;
    return (size / 1024).toFixed(fixed);
  };

  var loadingTimer = null, loadend = false,
    //数据传输总时间(即页面开始加载到最后一个请求完成的时间);
    transferTime;
  var checkTime = 5000;


  var speedTesting = {
    datas: [],
    init: function () {
      this.urls = [];

      //读取上次保存的配置
      var lastUrls = localStorage.getItem('urls');
      var lastRepeatTimes = localStorage.getItem('repeatTimes')||1;
      var lastReduceOver = localStorage.getItem('reduceOver')||0;
      $('#urls').val(lastUrls);
      $('#repeatTimes').val(lastRepeatTimes);
      $('#reduceOver').val(lastReduceOver);

      this.bindAction();
      this.getQuestFormServer();
    },
    bindAction: function () {
      var me = this;
      $('#startTesting').on('click', function () {
        me.urls = $.trim($('#urls').val()).split("\n");
        me.repeatTimes = $('#repeatTimes').val();
        me.reduceOver = $('#reduceOver').val();
        speedTesting.start();
      });
    },
    reset: function () {
      this.datas = [];
      //this.repeatTimes = 1;
      //this.reduceOver = 0;
      $('.report-content').remove();
      $('#chart-column').text('');
      $('#chart-pie-wrap').text('');
    },
    getQuestTimer: null,
    //从服务端请求测试参数
    getQuestFormServer: function () {
      var me = this;
      this.getQuestTimer = setTimeout(function () {
        $.ajax({
          url: 'http://127.0.0.1:9001/siteForPageLoad',
          cache: false,
          success: function (params) {
            if (params.sites) {
              me.urls = params.sites;
              me.repeatTimes = params.repeatTimes;
              me.reduceOver = params.reduceOver;
              
              $('#urls').val(me.urls.join('\n'));
              $('#repeatTimes').val(me.repeatTimes);
              $('#reduceOver').val(me.reduceOver);

              me.start();
            }
            else {
              me.getQuestFormServer();
            }
          },
          error: function () {
            me.getQuestFormServer();
          }
        });
      }, 1000);
    },
    //发送测试结果到服务器
    postReportToServer: function (arrangeDatas) {
      var me = this;
      $.post('http://127.0.0.1:9001/savepageloaddata', {
        reporter: arrangeDatas
      }, function (data) {
        me.getQuestFormServer();
      });
    },
    saveConfigs: function () {
      localStorage.setItem('urls', this.urls.join('\n'));
      localStorage.setItem('repeatTimes', this.repeatTimes);
      localStorage.setItem('reduceOver', this.reduceOver);
    },
    start: function () {
      clearLog();
      this.reset();
      logToPanel('begin testing');
      log('Start');
      this.saveConfigs();

      this.stop();
      chrome.devtools.network.onRequestFinished.addListener(this.onRequestFinished);
      chrome.devtools.network.onNavigated.addListener(this.onNavigated);
      //根据重复测试次数,重组urls
      var tempUrls = [];
      for (var i = 0; i < this.repeatTimes; i++) {
        tempUrls = tempUrls.concat(this.urls);
      }

      this.urls = tempUrls;
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
        logToPanel('GOTO:' + url);
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
            harParser.timings.transferTime = msToSec(transferTime);
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
      logToPanel('Finished,see the report below');
      log('Finished');
      var reporter = new Reporter(this.datas, { reduceOver: this.reduceOver })
      reporter.render();
      this.postReportToServer(reporter.arrangeDatas);
    }
  };

  speedTesting.init();
})(this)