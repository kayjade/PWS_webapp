var mn = 0;
var width = 960;
var height = 500;

function drawpicture(recorder) {

    if (mn == 0) {
        d3.select("canvas").remove();
        mode1(recorder);
    } else {
        d3.select("svg").remove();
        mode2(recorder);
    }
}

function stopdrawpicture() {
    if (mn == 0) {
        timer1.stop();
        clearInterval(timer2);
    } else {
        clearInterval(timer1);
        clearInterval(timer2);
    }
}

function saveimage() {
    if (mn == 0) {//canvas
        var canvas = d3.select("canvas");
        var base64Data = canvas.node().toDataURL("image/jpeg", 1.0);
        var blob = dataURItoBlob(base64Data);
        var fd = new FormData();
        fd.append("fileData", blob);
        fd.append("fileName", btoa(unescape(encodeURIComponent(canvas))));
        console.log(blob);
        $.ajax({
            url: '/saveimage',
            type: 'POST',
            data: fd,
            processData: false,
            contentType: false
        }).done(function (data) {
            if (data['isSuccess']) {
            } else {
                alert('Failed to save image');
            }
        }).fail(function (data) {
        });


    } else {//svg

    }
}

function dataURItoBlob(base64Data) {
    var byteString;
    if (base64Data.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(base64Data.split(',')[1]);
    else
        byteString = unescape(base64Data.split(',')[1]);
    var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
}

function mode1(recorder) {

    var canvas = d3.select(".svg").append('canvas')
        .attr("width", width)
        .attr("height", height);

    canvas.node().getContext("2d").fillStyle='#fffdf1';
    canvas.node().getContext("2d").fillRect(0,0,width,height);

    var x1 = width / 2,
        y1 = height / 2,
        i = 0,
        r = 150,
        τ = 2 * Math.PI;

    var context = canvas.node().getContext("2d");
    context.globalCompositeOperation = "source-over";
    context.lineWidth = 2;

    timer1 = d3.timer(function () {
        //context.clearRect(0, 0, width, height);

        var z = d3.hsl(++i % 360, 1, .5).rgb(),
            c = "rgba(" + z.r + "," + z.g + "," + z.b + ",",
            x = x1,
            y = y1;

        d3.select({}).transition()
            .duration(500)
            .delay(500)
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
        r = Math.max(d3.mean(FD), 5);
        x1 = width * Math.random();
        y1 = height * Math.random();
    }

    timer2 = window.setInterval(getdata, 500);
}


function mode2(recorder) {
    mn = 1;

    function getdata() {
        TD = recorder.timeData;
        FD = recorder.freqData;
        CTD = recorder.convTimeData;
        CFD = recorder.convFreqData;
    }

    time = 1;
    timer1 = window.setInterval(getdata, 300);
    timer2 = window.setInterval(area, 300);

    var width = 960,
        height = 500;
    var svg = d3.select(".svg").append('svg')
        .attr("width", width)
        .attr("height", height);
    svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white");
    var a = [], b = [], c = [], d = [], i;
    for (i = 0; i < 200; ++i) {
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

        $('svg').empty();
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
        if (0 <= ln && ln <= 4) {
            a[time] = d3.mean(FD) * 1.5;
            return a;
        } else if (5 <= ln && ln <= 9) {
            b[time] = d3.mean(TD) * 0.1;
            return b;
        } else if (10 <= ln && ln <= 14) {
            c[time] = d3.mean(CFD) * Math.random();
            return c;
        } else if (15 <= ln && ln <= 19) {
            d[time] = d3.mean(CTD) * Math.random();
            return d;
        }

    }
}

