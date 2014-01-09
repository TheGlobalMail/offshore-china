(function() {
  var colors, formatNum, formatPct, legendRectSize, margin, redraw, stack, svg, tip, wrapperG, x, xAxis, xAxisSvg, y, yAxis, yAxisSvg;

  margin = {
    t: 0,
    r: 40,
    b: 20,
    l: 130
  };

  x = d3.scale.ordinal();

  y = d3.scale.linear();

  stack = d3.layout.stack();

  colors = d3.scale.ordinal().range(['#03A679', '#FD9F44', '#FC5C65']);

  legendRectSize = 15;

  formatPct = d3.format('.2p');

  formatNum = d3.format(',');

  svg = d3.select('#chart').append('svg');

  wrapperG = svg.append('g').attr({
    "class": 'g-wrapper',
    transform: 'translate(' + [margin.l, margin.t] + ')'
  });

  xAxis = d3.svg.axis().tickSize(5, 0, 0).orient('left');

  yAxis = d3.svg.axis().orient('bottom');

  xAxisSvg = wrapperG.append('g').attr('class', 'x axis');

  yAxisSvg = wrapperG.append('g').attr('class', 'y axis');

  tip = d3.tip().attr('class', 'tooltip').direction('n').offset([-8, 0]).html(function(d) {
    if (d.name !== 'Other') {
      return '<p class="tooltip-p">Of ' + formatNum(d.total) + ' clients in <strong>' + d.region + '</strong>, <strong>' + formatPct(d.pct) + '</strong> used <strong>' + d.name + '</strong> as a tax haven.';
    } else {
      return '<p class="tooltip-p">Of ' + formatNum(d.total) + ' clients in <strong>' + d.region + '</strong>, <strong>' + formatPct(d.pct) + '</strong> used other tax havens.';
    }
  });

  d3.csv('data/percountry.csv', function(err, csv) {
    var keys, legendG, legendGroups, stackData, stackGroups;
    keys = d3.keys(csv[0]).filter(function(key) {
      return key !== 'Region' && key !== 'Companies';
    });
    csv = csv.sort(function(a, b) {
      return a.Companies - b.Companies;
    });
    stackData = stack(keys.map(function(name) {
      return csv.map(function(d) {
        return {
          name: name,
          region: d.Region,
          pct: d[name] / 100,
          total: d.Companies,
          y: (+d[name] / 100) * d.Companies
        };
      });
    }));
    x.domain(csv.map(function(d) {
      return d.Region;
    }));
    y.domain([
      0, d3.max(csv, function(d) {
        return +d.Companies;
      })
    ]);
    stackGroups = wrapperG.selectAll('.g-stack').data(stackData).enter().append('g').attr('class', 'g-stack');
    stackGroups.selectAll('rect').data(function(d) {
      return d;
    }).enter().append('rect').attr({
      "class": 'stack-rect'
    }).on('mouseover', tip.show).on('mouseout', tip.hide);
    legendG = wrapperG.append('g').attr('class', 'legend');
    legendG.append('rect').attr({
      "class": 'legend-box',
      width: 160,
      height: 95,
      y: -20,
      x: -10
    });
    legendG.append('text').attr('class', 'legend-title').text('China\'s tax havens');
    legendGroups = legendG.selectAll('.legendGroup').data(keys).enter().append('g').attr('class', 'legendGroup');
    legendGroups.append('rect').attr({
      width: legendRectSize,
      height: legendRectSize,
      y: function(d, i) {
        return 8 + i * (legendRectSize + 6);
      },
      x: 0,
      fill: function(d) {
        return colors(d);
      }
    });
    legendGroups.append('text').attr({
      y: function(d, i) {
        return 8 + i * (legendRectSize + 6);
      },
      dy: '0.95em',
      x: legendRectSize + 4
    }).text(function(d) {
      return d;
    });
    return redraw();
  });

  redraw = function() {
    var h, w;
    w = Math.min(960, window.innerWidth) - margin.l - margin.r;
    h = Math.min(350, window.innerHeight) - margin.t - margin.b;
    svg.attr({
      width: w + margin.l + margin.r,
      height: h + margin.t + margin.b
    });
    y.range([0, w]);
    x.rangeRoundBands([h, 0], 0.2);
    xAxis.scale(x);
    yAxis.tickSize(-h, 0, 0).scale(y);
    xAxisSvg.call(xAxis);
    yAxisSvg.attr('transform', 'translate(' + [0, h] + ')').call(yAxis);
    d3.selectAll('.y.axis text').attr('dy', 12);
    d3.selectAll('.stack-rect').attr({
      width: function(d) {
        return y(d.y);
      },
      height: x.rangeBand(),
      x: function(d) {
        return y(d.y0);
      },
      y: function(d) {
        return x(d.region);
      },
      fill: function(d) {
        return colors(d.name);
      }
    });
    d3.select('.legend').attr('transform', 'translate(' + [w - 150, h - 110] + ')');
    svg.append('text').attr({
      "class": 'y-label',
      transform: 'translate(' + [w - 10, h - 5] + ')'
    }).text('No. of offshore clients');
    return svg.call(tip);
  };

}).call(this);
