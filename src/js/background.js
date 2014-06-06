

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
  sendResponse({getHas:true});
});

//chrome.devtools.network.getHAR(function (har) {
//  console.log(har);
//});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case "log":
      console.log(message.obj);
      break;
  }
  return true;
});