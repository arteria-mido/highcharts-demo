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
    // console.log(communityCalculation);
    dt = createCommunityDatatableNormalized();
   
    data = google.visualization.arrayToDataTable(dt);

    //remove first row (date/time)
    dt.shift();
    document.getElementById('main-container').style.display = 'flex';
    
    // theme: Original
    let original = {
        chart: { 
            // renderTo: 'original',
            // events: {
            //     load: testLoadCallback,
            //     selection: testSelectionCallback,
            // }
        },
        xAxis: {  
            minRange: 24* 3600 * 1000,
            events: {
                afterSetExtremes: setCustomTickInterval,
            },     
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
    let pixelInterval;
    try {
        pixelInterval = (tDiff / xAxis.axis.len) * 100;
    } catch (e) {
        if (e instanceof TypeError) { 
            pixelInterval = (tDiff / xAxis.len) * 100;
        }
    } 
    let tickMarks = Math.round(tDiff / pixelInterval + 1); // 1 to accommodate first tick
    return tickMarks;
}

function customDTimeLabels(e) {
    let tDiff = ms2days(e.axis.max - e.axis.min);
    if (tDiff >= 171 && tDiff <= 194) 
    { return Highcharts.dateFormat('%b', this.value); }
    else if (tDiff > 194 && tDiff <= 330)
    { return Highcharts.dateFormat('%d %b', this.value); }
    else if (tDiff > 330)
    { return Highcharts.dateFormat('%b %y', this.value); }
    else if (tDiff < 171 && tDiff > 2) 
    { return Highcharts.dateFormat('%d. %b', this.value); }
    else if (tDiff <= 2) 
    {   
        let fullDay = 86400000;
        if (this.value % fullDay == 0) { return Highcharts.dateFormat('%d. %b', this.value); }
        else { return Highcharts.dateFormat('%H:%M', this.value); } 
    }
}

function setCustomTickInterval(e) {
    let min = e.min;
    let max = e.max;
    let tDiff = ms2days(max - min);
    let ticks = e.target.tickPositions;
    console.log(tickNumber(e.target));
    this.update({ 
        tickPositioner: function() {
            let newTickPositions = [];
            if (tDiff >= 171 && tDiff <= 194) {
                for (let i = 0; i < ticks.length - 1; i++) {
                    let dateObj1 = new Date(ticks[i]);
                    let dateObj2 = new Date(ticks[i + 1]);
                    if (dateObj1.getMonth() == dateObj2.getMonth()) {
                        newTickPositions.push(ticks[i]);
                        i++;
                    }
                }
                return newTickPositions;
            } else {
                let ticks = e.target.tickPositions;
                for (let i = 0; i < ticks.length - 1; i++) {
                    newTickPositions.push(ticks[i]);
                }
            }
            return newTickPositions;
        },
        labels: {
            formatter: customDTimeLabels
        }
    });

}