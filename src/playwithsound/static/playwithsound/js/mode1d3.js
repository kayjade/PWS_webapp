var mn = 1;

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

function savepng() {
    if (mn == 0) {//canvas

    } else {//svg
        d3.select('#saveButton').on('click', function () {
            var svgString = getSVGString(d3.select("svg").node());
            svgString2Image(svgString, 2 * 960, 2 * 500, 'png', save); // passes Blob and filesize String to the callback

            function save(dataBlob, filesize) {
                saveAs(dataBlob, 'D3 vis exported to PNG.png'); // FileSaver.js function
            }
        });
    }
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

// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString(svgNode) {
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    var cssStyleText = getCSSStyles(svgNode);
    appendCSS(cssStyleText, svgNode);

    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

    return svgString;

    function getCSSStyles(parentElement) {
        var selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push('#' + parentElement.id);
        for (var c = 0; c < parentElement.classList.length; c++)
            if (!contains('.' + parentElement.classList[c], selectorTextArr))
                selectorTextArr.push('.' + parentElement.classList[c]);

        // Add Children element Ids and Classes to the list
        var nodes = parentElement.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
            var id = nodes[i].id;
            if (!contains('#' + id, selectorTextArr))
                selectorTextArr.push('#' + id);

            var classes = nodes[i].classList;
            for (var c = 0; c < classes.length; c++)
                if (!contains('.' + classes[c], selectorTextArr))
                    selectorTextArr.push('.' + classes[c]);
        }

        // Extract CSS Rules
        var extractedCSSText = "";
        for (var i = 0; i < document.styleSheets.length; i++) {
            var s = document.styleSheets[i];

            try {
                if (!s.cssRules) continue;
            } catch (e) {
                if (e.name !== 'SecurityError') throw e; // for Firefox
                continue;
            }

            var cssRules = s.cssRules;
            for (var r = 0; r < cssRules.length; r++) {
                if (contains(cssRules[r].selectorText, selectorTextArr))
                    extractedCSSText += cssRules[r].cssText;
            }
        }


        return extractedCSSText;

        function contains(str, arr) {
            return arr.indexOf(str) === -1 ? false : true;
        }

    }

    function appendCSS(cssText, element) {
        var styleElement = document.createElement("style");
        styleElement.setAttribute("type", "text/css");
        styleElement.innerHTML = cssText;
        var refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore(styleElement, refNode);
    }
}


function svgString2Image(svgString, width, height, format, callback) {
    var format = format ? format : 'png';

    var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    var image = new Image();
    image.onload = function () {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob(function (blob) {
            var filesize = Math.round(blob.length / 1024) + ' KB';
            if (callback) callback(blob, filesize);
        });


    };

    image.src = imgsrc;
}