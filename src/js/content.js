

//new __Profiler().init();
//console.log(chrome);

//window.addEventListener('load', function () {

//  chrome.extension.sendRequest({ 'onload': true }, function (response) {
//    console.log(response);
//  });

//});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log('go ' + message.url);
  location.href = message.url;
});
