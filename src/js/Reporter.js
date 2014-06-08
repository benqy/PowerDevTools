(function (global) {
  'use strict';

  global.Reporter = function (hars) {
    this.hars = hars;    
  };

  global.Reporter.prototype = {
    push: function (har) {
      this.hars.push(har);
      this.renderReport(har);
    },
    render: function () {
      var me = this;
      this.hars.forEach(function (data) {
        me.renderReport(data);
      });
    },
    renderReport: function (data) {
      var ul = '<ul class="report report-content">';
      ul += '<li>' + data.site + '</li>';
      ul += '<li>' + data.requestCount + '</li>';
      ul += '<li>' + data.timings.onContentLoad + '</li>';
      ul += '<li>' + data.timings.onLoad + '</li>';
      ul += '<li>' + data.timings.blocked + '</li>';
      ul += '<li>' + data.timings.dns + '</li>';
      ul += '<li>' + data.timings.connect + '</li>';
      ul += '<li>' + data.timings.send + '</li>';
      ul += '<li>' + data.timings.wait + '</li>';
      ul += '<li>' + data.timings.receive + '</li>';
      ul += '<li>' + data.timings.ssl + '</li>';
      ul += '<li>' + data.timings.transferTime + '</li>';
      ul += '<li>' + data.size.transfer + '</li>';
      ul += '<li>' + data.size.content + '</li>';
      ul += '</ul>';
      $('#report').append(ul);
    }
  };
})(this);