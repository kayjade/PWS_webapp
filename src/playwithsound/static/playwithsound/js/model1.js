function drawpicture(recorder) {
    //mode1(recorder);
    mode2(recorder);
}

function stopdrawpicture() {
    timer.stop();
}

function mode1(recorder) {
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

    timer = d3.timer(function () {
        //context.clearRect(0, 0, width, height);

        var z = d3.hsl(++i % 360, 1, .5).rgb(),
            c = "rgba(" + z.r + "," + z.g + "," + z.b + ",",
            x = x1,
            y = y1;

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
        r = Math.min(d3.mean(FD) * 4, 200);
        x1 = width * Math.random();
        y1 = height * Math.random();
    }

    window.setInterval(getdata, 1000);
}


function mode2(recorder) {

    function getdata() {
        TD = recorder.timeData;
        FD = recorder.freqData;
        CTD = recorder.convTimeData;
        CFD = recorder.convFreqData;
    }

    time = 1;
    window.setInterval(getdata, 1000);
    window.setInterval(area, 1000);

    var width = 960,
        height = 500;
    var svg = d3.select(".svg").append('svg')
        .attr("width", width)
        .attr("height", height);

    var a = [], b = [], c = [], d = [], i;
    for (i = 0; i < 200; ++i){
        a[i] = 0;
        b[i] = 0;
        c[i] = 0;
        d[i] = 0;
    }
    function area() {
        var n = 20, // number of layers
            m = 200, // number of samples per layer
            k = 10; // number of bumps per layer

        var stack = d3.stack()
                .keys(d3.range(n))
                .offset(d3.stackOffsetWiggle),
            layers = stack(d3.transpose(d3.range(n).map(function (ln) {
                return bumps(ln, time);
            })));
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

        $('svg').empty()
        svg.selectAll("path")
            .data(layers)
            .enter().append("path")
            .attr("d", area)
            .attr("fill", function () {
                return z(Math.random());
            });
        time++;
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


// Inspired by Lee Byron’s test data generator.
    function bumps(ln, time) {
        if(ln == 0) {
            a[time] = d3.mean(FD)*50;
            return a;
        } else if(ln == 1) {
            b[time] = d3.mean(TD);
            return b;
        } else if(ln == 2) {
            c[time] = d3.mean(CFD)*Math.random();
            return c;
        } else if(ln >= 3) {
            d[time] = d3.mean(CTD)*Math.random();
            return d;
        }

    }


}