function drawpicture(recorder){
    mode1();
    function mode1() {
        var width = 960,
            height = 500;

        var canvas = d3.select(".svg").append('canvas')
        .attr("width", width)
        .attr("height", height);

        var x1 = width / 2,
            y1 = height / 2,
            i = 0,
            r = 200,
            τ = 2 * Math.PI;

        var context = canvas.node().getContext("2d");
        context.globalCompositeOperation = "source-over";
        context.lineWidth = 2;

        timer=d3.timer(function () {
            //context.clearRect(0, 0, width, height);

            var z = d3.hsl(++i % 360, 1, .5).rgb(),
                c = "rgba(" + z.r + "," + z.g + "," + z.b + ",",
                x = x1 ,
                y = y1 ;

            d3.select({}).transition()
                .duration(500)
                .ease(Math.sqrt)
                .tween("circle", function () {
                    return function (t) {
                        context.strokeStyle = c + (1 - t) + ")";
                        context.beginPath();
                        context.arc(x, y, r * t, 0, τ);
                        context.stroke();
                    };
                });
        });

        function getdata() {
            TD = recorder.timeData;
            FD = recorder.freqData;
            r = Math.min(d3.mean(FD)*4,200);
            x1 =width*Math.random();
            y1 = height*Math.random();
        }
        window.setInterval(getdata, 1000);
    }


    function mode2() {
        var n = 20, // number of layers
            m = 200, // number of samples per layer
            k = 10; // number of bumps per layer
        var svg = d3.select(".svg").append('svg'),
        width = +svg.attr("width"),
        height = +svg.attr("height");
        var stack = d3.stack()
                .keys(d3.range(n))
                .offset(d3.stackOffsetWiggle),
            layers0 = stack(d3.transpose(d3.range(n).map(function () {
                return bumps(m, k);
            }))),
            layers1 = stack(d3.transpose(d3.range(n).map(function () {
                return bumps(m, k);
            }))),
            layers = layers0.concat(layers1);
        console.log(layers0);

        var x = d3.scaleLinear()
            .domain([0, m - 1])
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
            .range([height, 0]);

//https://github.com/d3/d3-scale
        var z = d3.interpolateCool;

        var area = d3.area()
            .x(function (d, i) {
                return x(i);
            })
            .y0(function (d) {
                return y(d[0]);
            })
            .y1(function (d) {
                return y(d[1]);
            });

        svg.selectAll("path")
            .data(layers0)
            .enter().append("path")
            .attr("d", area)
            .attr("fill", function () {
                return z(Math.random());
            });
    }

    function stackMax(layer) {
        return d3.max(layer, function (d) {
            return d[1];
        });
    }

    function stackMin(layer) {
        return d3.min(layer, function (d) {
            return d[0];
        });
    }

    function transition() {
        var t;
        d3.selectAll("path")
            .data((t = layers1, layers1 = layers0, layers0 = t))
            .transition()
            .duration(2500)
            .attr("d", area);
    }

// Inspired by Lee Byron’s test data generator.
    function bumps(n, m) {
        var a = [], i;
        for (i = 0; i < n; ++i) a[i] = 0;
        for (i = 0; i < m; ++i) bump(a, n);
        return a;
    }

    function bump(a, n) {
        var x = 1 / (0.1 + Math.random()),
            y = 2 * Math.random() - 0.5,
            z = 10 / (0.1 + Math.random());
        for (var i = 0; i < n; i++) {
            var w = (i / n - y) * z;
            a[i] += x * Math.exp(-w * w);
        }
    }

}

function stopdrawpicture() {
    timer.stop();
}
