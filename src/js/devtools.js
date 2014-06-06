
chrome.devtools.panels.create("My Panel",
    "img/icon.png",
    "panel.html",
    function (panel) {
      // code invoked on panel creation
    }
);
//chrome.devtools.inspectedWindow.eval(
//    "jQuery.fn.jquery",
//    function (result, isException) {
//      if (isException)
//        console.log("the page is not using jQuery");
//      else
//        console.log("The page is using jQuery v" + result);
//    }
//);


  //if (request.response.bodySize > 40 * 1024)

(function (global) {
  global.log = function (obj) {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "log", obj: obj });
    }
  };

  try {
    var loadingTimer = null, loadend = false,
      //数据传输总时间(即页面开始加载到最后一个请求完成的时间);
      transferTime;
    var checkTime = 2000;
    //5s之内没有任何页面请求之后,获取har
    var getHAR = function () {
      clearTimeout(loadingTimer);
      loadingTimer = setTimeout(function () {
        //同一个页面只计算一次
        if (!loadend) {
          loadend = true;
          transferTime = Date.now() - transferTime - checkTime;
          chrome.devtools.network.getHAR(function (harObj) {
            var harParser = new HARParser(harObj);
            harParser.timings.transferTime = transferTime;
            log(harParser);
            //log(harParser.har.pages[0].startedDateTime.toString());
          });
        }
      }, checkTime);
    };

    chrome.devtools.network.onRequestFinished.addListener(function (req) {
      
      getHAR();
    });

    chrome.devtools.network.onNavigated.addListener(function (a) {
      loadend = false;
      transferTime = Date.now();
      getHAR()
    });

  }
  catch (e) {
    log(e.toString());
  }



})(this);