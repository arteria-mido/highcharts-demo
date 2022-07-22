let communityCalculation = {};
let MAX_DATAPOINTS = 100;

// general options:
let cOriginal, range;
let chartOptions = {
    chart: { type: 'area', zoomType: 'x' },
    title: { text: 'Chart Title', useHTML: true },
    xAxis: { 
        crosshair: true,
        title: { text: 'Zeit [Stunde]'},
        // categories: dt.map(d => d[0]),
        type: 'datetime',
    },
    yAxis: { title: { text: 'Leistung [kWe.]' }	},
    tooltip: { shared: true },
    credits: { enabled: false },
    plotOptions: { 
        area: { fillOpacity: 0.7 , stacking: 'normal', lineWidth: 1}, 
        spline: {lineWidth: 3}, 
        series: { marker: { enabled: false }}
    },
    // responsive: {
    //     rules: [{
    //         condition: { maxWidth: 500},
    //         chartOptions: {
    //             legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal'}, 
    //             credits: { enabled: false }
    //         }
    //     }]
    // }
};

window.addEventListener('DOMContentLoaded', (event) => {
    google.charts.load('current', { 'packages': ['corechart'] });
    document.getElementById("btn_loadFile").addEventListener("change", loadFile);

});

function loadFile(evt) {
    // console.log(evt);
    let file = evt.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = fileLoaded;
}

function fileLoaded(evt) {
    let fileString = evt.target.result;
    let json = JSON.parse(fileString);
    communityCalculation = json;
    

    dt = createCommunityDatatableNormalized();
    // console.log(dt);
    
    data = google.visualization.arrayToDataTable(dt);

    // original G chart
    // drawGcharts(data);

    //remove first row (date/time)
    dt.shift();
    document.getElementById('main-container').style.display = 'flex';
    
    // theme: Original
    let original = {
        chart: { 
            // renderTo: 'original',
            events: {
                load: testLoadCallback,
                selection: testSelectionCallback,

            }
        },
        xAxis: {
            /*
            labels: {
                formatter: function() {
                    let tDiff = this.axis.getExtremes().max - this.axis.getExtremes().min;
                    if (tDiff >= days2ms(171)) {
                        return Highcharts.dateFormat('%b %y', this.value);
                    }
                    else {
                        return Highcharts.dateFormat('%d %b', this.value);
                    }
                }
            },
            tickPositioner: function(min, max) {
                var pos, tickPositions = [];
                let newtickpositions = [];
                let interval = 0;
                // console.log(range); // 370 days
                // console.log(days2ms(171));
                if ((max - min) <= range && (max - min) > days2ms(171)) {
                    interval = 28 * 24 * 3600 * 1000; //interval as 1 month
                    for (pos = min; pos <= max; pos += interval) {
                        tickPositions.push(pos);
                    }
                } else {
                    interval = 4 * 3600 * 1000;
                    for (pos = min; pos <= max; pos += interval) {
                        tickPositions.push(pos);
                    }
                    if (tickPositions.length > 12) {
                        let step = tickPositions.length/12;
                        // console.log(tickPositions.length);
                        for (let i = 0; i < tickPositions.length; i+=step) {
                            newtickpositions.push(parseInt(tickPositions[0]) + i * interval);
                        }
                    }
                    // console.log(newtickpositions);
                    return newtickpositions;
                }
                // TODO: set tickPositions to always have max 12 elements
                return tickPositions;
            },
            */
        },
        title: { text:  'theme: Original (edited)'},
        series: [         
            { name: "Netzbezug", color: '#cfc9d5', data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            { name: "Netzeinspeisung", color: '#855a87', data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            { name: "Eigenversorgung", color: '#b8dc45', data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#fcf299', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#00deff', data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    };
    cOriginal = Highcharts.chart('original', Highcharts.merge(chartOptions, original));

    // cOriginal = new Highcharts.Chart(Highcharts.merge(chartOptions, original), function (cOriginal) { 
        // range = cOriginal.xAxis[0].getExtremes().max - cOriginal.xAxis[0].getExtremes().min;
        // let spans = document.getElementsByTagName('span');
        // Array.from(spans).forEach(s => {
        //     if (s.innerHTML === cOriginal.title.textStr) {
        //         s.addEventListener('click', () => {
        //             document.getElementById('main-container').style.flexDirection = 'column';
        //             cOriginal.setSize(null);
        //             cSummer.setSize(null);
        //             cDark.setSize(null);
        //             cHay.setSize(null);
        //             let original = document.getElementById('original');
        //             original.parentNode.insertBefore(original, original.parentNode.firstChild);

        //         })
        //     }
        // })
    // });

    /*
    // theme: Summer
    let summer = {
        chart: { renderTo: 'summer' },
        title: { text:  'theme: Summer'},
        plotOptions: {spline: {lineWidth: 4}},
        series: [         
            {   name: "Netzbezug", 
                color: '#f4ddbb', 
                lineColor: 'rgba(229, 129, 92, .15)',
                fillColor: {
                  linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                  stops: [
                    [0, 'rgba(229, 129, 92, .9)'],
                    [1, 'rgba(255,255,255,.5)']
                  ]
                },
                data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            {   name: "Netzeinspeisung", 
                color: '#f3a284', 
                lineColor: 'rgba(229, 129, 92, .25)',
                fillColor: {
                    linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, 'rgba(252, 196, 145, 1)'],
                        [1, 'rgba(255,255,255,1)']
                ]},
                data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            {   name: "Eigenversorgung", 
                color: '#a3edba', 
                marker: { fillColor: '#a3edba'},
                lineColor: 'rgba(67,235,217,.5)',
                fillColor: {
                    linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, 'rgba(67,235,217,.9)'],
                        [1, 'rgba(163, 237, 186, .6)'],
                ]},
                data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#fde79b', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#7dd6ff',  lineWidth: 3,data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    };

    let cSummer = new Highcharts.Chart(Highcharts.merge(chartOptions, summer), function (cSummer) { 
        let spans = document.getElementsByTagName('span');
        Array.from(spans).forEach(s => {
            if (s.innerHTML === cSummer.title.textStr) {
                s.addEventListener('click', () => {
                    document.getElementById('main-container').style.flexDirection = 'column';
                    cOriginal.setSize(null);
                    cSummer.setSize(null);
                    cDark.setSize(null);
                    cHay.setSize(null);
                    let summer = document.getElementById('summer');
                    summer.parentNode.insertBefore(summer, summer.parentNode.firstChild);

                })
            }
        })
    });

    // theme: neutralDark
    let dark = {
        chart: { renderTo: 'neutralDark' },
        title: { text:  'theme: Neutral Dark'},
        series: [         
            { name: "Netzbezug", color: '#aca6d4', data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            { name: "Netzeinspeisung", color: '#60609c', data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            { name: "Eigenversorgung", color: '#a3edba', data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#fcf299', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#a3acff', data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    };

    let cDark = new Highcharts.Chart(Highcharts.merge(chartOptions, dark), function (cDark) { 
        let spans = document.getElementsByTagName('span');
        Array.from(spans).forEach(s => {
            if (s.innerHTML === cDark.title.textStr) {
                s.addEventListener('click', () => {
                    document.getElementById('main-container').style.flexDirection = 'column';
                    cOriginal.setSize(null);
                    cSummer.setSize(null);
                    cDark.setSize(null);
                    cHay.setSize(null);
                    let cdark = document.getElementById('neutralDark');
                    cdark.parentNode.insertBefore(cdark, cdark.parentNode.firstChild);

                })
            }
        })
    });

    // theme: haystack
    let haystack = {
        chart: { renderTo: 'haystack' },
        title: { text: 'theme: Haystack'},
        series: [         
            { name: "Netzbezug", color: '#edecc0', data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            { name: "Netzeinspeisung", color: '#e5e39b', data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            { name: "Eigenversorgung", color: '#a1d49b', data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#ffe792', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#99aecb', data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    };

    let cHay = new Highcharts.Chart(Highcharts.merge(chartOptions, haystack), function (cHay) { 
        let spans = document.getElementsByTagName('span');
        Array.from(spans).forEach(s => {
            if (s.innerHTML === cHay.title.textStr) {
                s.addEventListener('click', () => {
                    document.getElementById('main-container').style.flexDirection = 'column';
                    cOriginal.setSize(null);
                    cSummer.setSize(null);
                    cDark.setSize(null);
                    cHay.setSize(null);
                    let hay = document.getElementById('haystack');
                    hay.parentNode.insertBefore(hay, hay.parentNode.firstChild);

                })
            }
        })
    });

    // theme: meadows
    let auen = {
        chart: { renderTo: 'meadows'},
        title: { text: 'theme: Meadows'},
        series: [         
            { name: "Netzbezug", color: '#dfd0a7', data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            { name: "Netzeinspeisung", color: '#987766', data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            { name: "Eigenversorgung", color: '#8ac16c', data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#eeef63', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#6c8b8e', data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    };
    
    let cMeadows = new Highcharts.Chart(Highcharts.merge(chartOptions, auen), function (cMeadows) {
        console.log('do nothing');
    });
    */
}

function createCommunityDatatableNormalized() {
    let dt = [];
    dt.push([
        "Datum",
        "Eigenstrom",
        "EEGStrom",
        "Netzbezug",
        "Netzeinspeisung",
        "PV Produktion",
        "Strombedarf",
    ]);



    let startindex = 0;
    let endIndex = communityCalculation.timeSteps.length;
    // for (let i = 0; i < communityCalculation.timeSteps.length; i++) {
    //     const dTime = new Date(communityCalculation.timeSteps[i]);
    //     if (startindex <= 0 && dTime >= startDate) {
    //         startindex = i;
    //     }
    //     if (dTime > endDate) {
    //         endIndex = i;
    //         break;
    //     }
    // }
    let stepLength = endIndex - startindex;
    let increment = 1;

    while (stepLength / increment > MAX_DATAPOINTS) {
        increment++;
    }

    for (let idx = startindex; idx < endIndex; idx = idx + increment) {
        const dTime = new Date(communityCalculation.timeSteps[idx]);

        let data = [];
        const comm = communityCalculation.community;
        // data.push(dTime.toLocaleDateString().substring(0, 5) + " " + dTime.toTimeString().substring(0, 5));
        // data.push(dTime.toLocaleTimeString().substring(0, 5)); // original code
		// Mi's testing highcharts migration
        data.push(dTime.getTime());
        // ---
        data.push(comm.sum_self_cons1[idx]);
        data.push(comm.sum_self_cons2plus3[idx]);
        data.push(comm.grid_cons[idx]);
        data.push(comm.pv_surplus[idx]);
        data.push(comm.total_prod[idx]);
        data.push(comm.total_power_cons[idx]);
        dt.push(data);

    }

    return dt;
}

function roundFloat(float, digit) {
    return Number(parseFloat(float).toFixed(digit));
}

function drawGcharts(data) {
    let goptions = {
        title: 'Original Google Charts',
        vAxis: { title: 'Leistung [kWe.]' },
        hAxis: { title: 'Zeit [Stunde]' },
        seriesType: 'area',
        crosshair: { trigger: 'both'},
        focusTarget: 'category',
        series: {
            0: { color: '#11ab00' },
            1: { color: '#00ef66' },
            2: { color: '#aaaaaa' },
            3: { color: '#444444' },
            4: { color: '#ffee00', type: 'line', lineWidth: 4 },
            5: { color: '#dd22ee', type: 'line', lineWidth: 4 }
        },
        isStacked: true,
    };
    let gChartElement = document.getElementById('gchart');
    gChartElement.style.display = 'block';
    let chart = new google.visualization.ComboChart(gChartElement);
    chart.draw(data, goptions);

}

function days2ms(days=0) {
    return days * 24 * 3600 * 1000;
}

function ms2days(ms=0) {
    return ms / (24*3600*1000);
}

function testLoadCallback() {
    var xAxis = this.xAxis[0];
    for (let i = 0; i < xAxis.tickPositions.length - 1; i++) {
        let diff = xAxis.tickPositions[i + 1] - xAxis.tickPositions[i];
    }
}

function testSelectionCallback(event) {
    if(event.xAxis != null) {
        let tDiff = event.xAxis[0].max - event.xAxis[0].min;
        let isHalfYear = tDiff >= days2ms(171) && tDiff <= days2ms(194);
        if (isHalfYear) {
            console.log('Printing from testSelectionCallback: how many ticks?');
            console.log(tickNumber(event.xAxis[0]));
        }
    } else { }
}

function tickNumber (xAxis) {
    let tDiff = ms2days(xAxis.max - xAxis.min);
    let pixelInterval = (tDiff / xAxis.axis.len) * 100;
    let tickMarks = Math.round(tDiff / pixelInterval + 1); // 1 to accommodate first tick
    return tickMarks;
}