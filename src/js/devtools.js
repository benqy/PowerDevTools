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
chrome.devtools.panels.create("PowerDev",
  "img/icon.png",
  "panel.html",
  function (panel) {
    // code invoked on panel creation
  }
);