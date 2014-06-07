(function (global) {

  var speedTesting = {
    init: function () {
      var urls = $.trim($('#urls').val()).split("\n");
      this.urls = urls;
      this.next();
    },
    next: function () {
      var url = this.urls.shift();
      chrome.extension.sendRequest({ 'speedTesting': url }, function (response) {
        console.log(response);
      });
    }
  };

  speedTesting.init();

})(this)