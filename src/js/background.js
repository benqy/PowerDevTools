

//chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
//  console.log('req');
//  sendResponse({getHas:true});
//});

//chrome.devtools.network.getHAR(function (har) {
//  console.log(har);
//});

var messageCenter = {
  start_speed_testing: function (params, sender, sendResponse) {
    console.log('开始导航网页:' + params.url);
    chrome.tabs.sendMessage(params.tabId, { type: 'navToUrl', url: params.url }, function (res) {
    });
  },
  log: function (params, sender, sendResponse) {
    console.log(params);
  }
};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (messageCenter[message.type]) {
    messageCenter[message.type](message.obj, sender, sendResponse);
  }
  else {
    console.log('message type not find', message);
  }
  return true;
});

