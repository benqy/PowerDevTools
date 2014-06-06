(function (global) {
  global.HARParser = function (har) {
    this.har = har;
    this.size = {
      transfer: 0,
      content:0
    };//byte
    this.timings = {
      blocked: 0,
      connect: 0,
      dns: 0,
      receive: 0,
      send: 0,
      ssl: 0,
      wait: 0,
      transferTime:0
    };
    this.parse();
  };

  global.HARParser.prototype = {
    getInfo: function () {
      //this.site = this.har.pages[0].title;
    },
    calcTimes: function () {
      //this.times.load = this.har.
    },
    parse: function () {
      var me = this;
      this.har.entries.forEach(function (entrie) {
        //传输数据大小
        me.size.transfer += entrie.response.bodySize;
        //文件总大小
        me.size.content += entrie.response.content.size;
      
        //请求各阶段时间和[blocked,connect,dns,receive,send,ssl,wait]
        Object.keys(entrie.timings).forEach(function (key) {
          me.timings[key] += entrie.timings[key] >= 0 ? entrie.timings[key] : 0;
        });
      });
      this.timings.onLoad = this.har.pages[0].pageTimings.onLoad;
      this.timings.onContentLoad = this.har.pages[0].pageTimings.onContentLoad;
    }
  };
})(this);

