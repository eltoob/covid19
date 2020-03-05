let myChart;
function loadChart() {
    var ctx = document.getElementById("myChart").getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
      responsive:true,
    // maintainAspectRatio: false,
        data: {
            datasets: [
                {
                label: 'Infected',
                data: [],
                borderColor: [
                    'red'
                ],
                borderWidth: 3
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

Chart.defaults.global.animation.duration = 0;