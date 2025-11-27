document.addEventListener('DOMContentLoaded', () => {
    initializeResultCharts();
});

function initializeResultCharts() {
    fetch('/api/results')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched data:', data);

            // Convert accuracy from 0-1 → 0-100 %
            const accuracyPercent = Object.fromEntries(
                Object.entries(data.accuracy).map(([domain, value]) => [domain, Math.round(value * 100)])
            );

            // Convert responseTime from ms → seconds (2 decimals)
            const responseTimesSec = Object.fromEntries(
                Object.entries(data.responseTimes).map(([domain, value]) => [domain, parseFloat((value / 1000).toFixed(2))])
            );

            createAccuracyChart(accuracyPercent);
            createResponseTimeChart(responseTimesSec);
            createSummaryChart({ accuracy: accuracyPercent, responseTimes: responseTimesSec });
        })
        .catch(error => {
            console.error('Error fetching results:', error);

            // Fallback mock data
            const mockData = {
                accuracy: { History: 85, Social_Science: 78, Computer_Security: 92 },
                responseTimes: { History: 2.3, Social_Science: 1.8, Computer_Security: 3.1 }
            };
            createAccuracyChart(mockData.accuracy);
            createResponseTimeChart(mockData.responseTimes);
            createSummaryChart({ accuracy: mockData.accuracy, responseTimes: mockData.responseTimes });
        });
}

function createAccuracyChart(accuracyData) {
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(accuracyData),
            datasets: [{
                label: 'Accuracy (%)',
                data: Object.values(accuracyData),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 206, 86)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: 'Accuracy (%)' } }
            }
        }
    });
}

function createResponseTimeChart(responseTimeData) {
    const ctx = document.getElementById('responseTimeChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(responseTimeData),
            datasets: [{
                label: 'Response Time (s)',
                data: Object.values(responseTimeData),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Time (seconds)' } }
            }
        }
    });
}

function createSummaryChart(data) {
    const ctx = document.getElementById('summaryChart').getContext('2d');

    const scaleResponseTime = sec => Math.max(0, 100 - sec * 10); 

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Accuracy', 'Response Time', 'Consistency', 'Complexity', 'Reliability'],
            datasets: [
                {
                    label: 'History',
                    data: [
                        data.accuracy.History || 0,
                        scaleResponseTime(data.responseTimes.History || 0),
                        85, 70, 80
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    pointBackgroundColor: 'rgb(255, 99, 132)'
                },
                {
                    label: 'Social Science',
                    data: [
                        data.accuracy.Social_Science || 0,
                        scaleResponseTime(data.responseTimes.Social_Science || 0),
                        75, 85, 78
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)'
                },
                {
                    label: 'Computer Security',
                    data: [
                        data.accuracy.Computer_Security || 0,
                        scaleResponseTime(data.responseTimes.Computer_Security || 0),
                        90, 95, 88
                    ],
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgb(255, 206, 86)',
                    pointBackgroundColor: 'rgb(255, 206, 86)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                r: { suggestedMin: 0, suggestedMax: 100, angleLines: { display: true } }
            }
        }
    });
}
