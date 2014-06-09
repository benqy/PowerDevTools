/*
http://ent.qq.com
http://www.mtime.com/
http://www.17173.com
http://www.duowan.com
*/

(function (global) {
  'use strict';

  global.Reporter = function (hars) {
    this.hars = hars;
  };

  global.Reporter.prototype = {
    render: function () {
      var me = this;
      this.hars.forEach(function (data) {
        me.renderReport(data);
      });
      this.renderColumn();
    },
    renderColumn: function () {
      var datas = [], chart;
      this.hars.forEach(function (data) {
        datas.push({
          type: 'stackedColumn100',
          name: data.site,
          showInLegend: "true",
          dataPoints: [
            { label: '请求数', y: data.requestCount },
            { label: 'DOMContentLoad', y: data.timings.onContentLoad * 1000||0 },
            { label: 'Onload', y: data.timings.onLoad * 1000 || 0 },
            { label: '加载总用时', y: data.timings.transferTime * 1000 || 0 },
            { label: 'Blocked', y: data.timings.blocked * 1000 || 0 },
            { label: 'DNS', y: data.timings.dns * 1000 || 0 },
            { label: 'Connect', y: data.timings.connect * 1000 || 0 },
            { label: 'Send', y: data.timings.send * 1000 || 0 },
            { label: 'Wait', y: data.timings.wait * 1000 || 0 },
            { label: 'Receive', y: data.timings.receive * 1000 || 0 },
            { label: 'SSL', y: data.timings.ssl * 1000 || 0 },
            { label: '传输大小', y: data.size.transfer * 1024 || 0 },
            { label: '文件大小', y: data.size.content * 1024 || 0 }
          ]
        });
      });

      var chart = new CanvasJS.Chart("chart-column", {
        title: {
          text: "横向数据对比(单位:字节,毫秒)"
        },
        axisX: {
          title: "对比项目"
        },
        axisY: {
          title: "百分比"
        },
        data: datas
      });
      chart.render();
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