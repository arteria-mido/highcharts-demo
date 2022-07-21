let communityCalculation = {};
let MAX_DATAPOINTS = 100;

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
    console.log(dt);
    
    data = google.visualization.arrayToDataTable(dt);

    // original G chart
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

    //remove first row (date/time)
    dt.shift();

    let gChartElement = document.getElementById('gchart');
    let chart = new google.visualization.ComboChart(gChartElement);
    chart.draw(data, goptions);
    
    // general options:
    let chartOptions = {
        chart: { type: 'area', zoomType: 'x' },
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
        }
    };

    // theme: Original
    let original = {
        title: { text:  'theme: Original (edited)'},
        series: [         
            { name: "Netzbezug", color: '#cfc9d5', data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            { name: "Netzeinspeisung", color: '#855a87', data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            { name: "Eigenversorgung", color: '#b8dc45', data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#fcf299', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#00deff', data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    }

    Highcharts.chart('original', Highcharts.merge(chartOptions, original));

    // theme: Summer
    let summer = {
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

    Highcharts.chart('summer', Highcharts.merge(chartOptions, summer));

    // theme: neutralDark
    let dark = {
        title: { text:  'theme: Neutral Dark'},
        series: [         
            { name: "Netzbezug", color: '#aca6d4', data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            { name: "Netzeinspeisung", color: '#60609c', data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            { name: "Eigenversorgung", color: '#a3edba', data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#fcf299', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#a3acff', data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    };

    Highcharts.chart('neutralDark', Highcharts.merge(chartOptions, dark));

    // theme: haystack
    let haystack = {
        title: { text: 'theme: Haystack'},
        series: [         
            { name: "Netzbezug", color: '#edecc0', data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            { name: "Netzeinspeisung", color: '#e5e39b', data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            { name: "Eigenversorgung", color: '#a1d49b', data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#ffe792', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#99aecb', data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    };

    Highcharts.chart('haystack', Highcharts.merge(chartOptions, haystack));

    // theme: meadows
    let auen = {
        title: { text: 'theme: Meadows'},
        series: [         
            { name: "Netzbezug", color: '#dfd0a7', data: dt.map(d => [d[0], roundFloat(d[3], 2)]) },
            { name: "Netzeinspeisung", color: '#987766', data: dt.map(d => [d[0], roundFloat(d[4], 2)]) },
            { name: "Eigenversorgung", color: '#8ac16c', data: dt.map(d => [d[0], roundFloat(d[1], 2)]) },
            { name: "PV Erzeugung", type: 'spline', color: '#eeef63', data: dt.map(d => [d[0], roundFloat(d[5], 2)]) },
            { name: "Strombedarf", type: 'spline', color: '#6c8b8e', data: dt.map(d => [d[0], roundFloat(d[6], 2)]) },
        ]
    };
    
    Highcharts.chart('meadows', Highcharts.merge(chartOptions, auen));

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