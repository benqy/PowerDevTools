

//new __Profiler().init();
//console.log(chrome);

window.addEventListener('load', function () {

  chrome.extension.sendRequest({ 'onload': true }, function (response) {
    console.log(response);
  });

});