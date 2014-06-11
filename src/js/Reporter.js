/*
http://ent.qq.com
http://www.mtime.com/
http://www.17173.com
http://www.duowan.com
*/

(function (global) {
  'use strict';

  var dataPros = 'requestCount,onContentLoad,onLoad,blocked,dns,connect,send,wait,receive,ssl,transferTime,transfer,content';
  var piePoints = 'blocked,dns,connect,send,wait,receive,ssl';

  global.Reporter = function (harParsers, option) {
    this.option = $.extend({}, { reduceOver: 0 }, option);
    //reduceOver
    this.originalHarParsers = harParsers;
    this.arrangeDatas = [];
  };

  global.Reporter.prototype = {
    render: function () {
      var me = this;
      this.arrangeHarParsers();
      this.renderColumn();
      this.arrangeDatas.forEach(function (data) {
        me.renderReport(data);
        me.renderPie(data);
      });
    },
    arrangeHarParsers: function () {
      //先按网址分组
      var me = this, groupsBySite = {};
      this.originalHarParsers.forEach(function (harParser) {
        groupsBySite[harParser.site] = groupsBySite[harParser.site] || [];
        groupsBySite[harParser.site].push(harParser);
      });

      //log(groupsBySite);
      Object.keys(groupsBySite).forEach(function (site) {
        var group = groupsBySite[site], harParser, data = { site: site, originalData: {}, avgData: {} };
        //快速生成属性
        dataPros.split(',').forEach(function (pro) {
          data.originalData[pro] = [];
        });

        //按状态名称分类存在数组里
        for (var i = 0; i < group.length; i++) {
          harParser = group[i];
          Object.keys(harParser.timings).forEach(function (key) {
            data.originalData[key].push(harParser.timings[key]);
          });
          Object.keys(harParser.size).forEach(function (key) {
            data.originalData[key].push(harParser.size[key]);
          });
          data.originalData.requestCount.push(harParser.requestCount);
        }
        //排序数据
        Object.keys(data.originalData).forEach(function (statusName) {
          data.originalData[statusName] = data.originalData[statusName].sort(function (a, b) {
            return a > b;
          });
          log({ l: 'reporter63', d: data.originalData[statusName] });
          //去掉最高和最低值
          if (me.option.reduceOver) {
            data.originalData[statusName] = data.originalData[statusName].slice(me.option.reduceOver);
            data.originalData[statusName] = data.originalData[statusName].slice(0, data.originalData[statusName].length - me.option.reduceOver);
          }
          log({ l: 'reporter69', d: data.originalData[statusName] });
          //计算平均值
          var avg = 0;
          data.originalData[statusName].forEach(function (n) {
            avg += n * 1;
          });
          data.avgData[statusName] = (avg / data.originalData[statusName].length).toFixed(3);
        });
        me.arrangeDatas.push(data);
      });
      log({ l: 'reporter80', data: this.arrangeDatas });
    },
    renderColumn: function () {
      var datas = [], chart;
      this.arrangeDatas.forEach(function (data) {
        datas.push({
          type: 'stackedColumn100',
          name: data.site,
          showInLegend: "true",
          dataPoints: [
            { label: '请求数', y: (data.avgData.requestCount * 1).toFixed(0) * 1 },
            { label: 'DOMContentLoad', y: data.avgData.onContentLoad * 1000 || 0 },
            { label: 'Onload', y: data.avgData.onLoad * 1000 || 0 },
            { label: '加载总用时', y: data.avgData.transferTime * 1000 || 0 },
            { label: 'Blocked', y: data.avgData.blocked * 1000 || 0 },
            { label: 'DNS', y: data.avgData.dns * 1000 || 0 },
            { label: 'Connect', y: data.avgData.connect * 1000 || 0 },
            { label: 'Send', y: data.avgData.send * 1000 || 0 },
            { label: 'Wait', y: data.avgData.wait * 1000 || 0 },
            { label: 'Receive', y: data.avgData.receive * 1000 || 0 },
            { label: 'SSL', y: data.avgData.ssl * 1000 || 0 },
            { label: '传输大小', y: data.avgData.transfer * 1024 || 0 },
            { label: '文件大小', y: data.avgData.content * 1024 || 0 }
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
    renderPie: function (data) {
      var id = 'd' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      $('#chart-pie-wrap').append('<div id="'+id+'" class="chart-pie"></div>');
      var points = [];
      piePoints.split(',').forEach(function (pro) {
        points.push({ y: data.avgData[pro] * 1000, legendText: pro,indexLabel:pro });
      });
      var chart = new CanvasJS.Chart(id, {
        title: {
          text: data.site
        },
        legend: {
          verticalAlign: "bottom",
          horizontalAlign: "center"
        },
        data: [{
          indexLabelFontSize: 20,
          indexLabelFontFamily: "Monospace",
          indexLabelFontColor: "darkgrey",
          indexLabelLineColor: "darkgrey",
          indexLabelPlacement: "outside",
          type: "pie",
          showInLegend: true,
          dataPoints: points
        }]
      });

      chart.render();
    },
    renderReport: function (data) {
      var ul = '<ul class="report report-content">';
      ul += '<li>' + data.site + '</li>';
      ul += '<li>' + (data.avgData.requestCount * 1).toFixed(0) + '</li>';
      ul += '<li>' + data.avgData.onContentLoad + '</li>';
      ul += '<li style="color:red;">' + data.avgData.onLoad + '</li>';
      ul += '<li>' + data.avgData.blocked + '</li>';
      ul += '<li>' + data.avgData.dns + '</li>';
      ul += '<li>' + data.avgData.connect + '</li>';
      ul += '<li>' + data.avgData.send + '</li>';
      ul += '<li>' + data.avgData.wait + '</li>';
      ul += '<li>' + data.avgData.receive + '</li>';
      ul += '<li>' + data.avgData.ssl + '</li>';
      ul += '<li>' + data.avgData.transferTime + '</li>';
      ul += '<li style="color:red;">' + data.avgData.transfer + '</li>';
      ul += '<li>' + data.avgData.content + '</li>';
      ul += '</ul>';
      $('#report').append(ul);
    }
  };
})(this);