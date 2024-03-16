const chartJsScriptUrl = 'https://cdn.jsdelivr.net/npm/chart.js';

export class Adashta {
  adashtaHost;
  adashtaPort;
  chartData = {};

  constructor(config) {
    this.adashtaHost = config.adashtaHost || 'localhost';

    if (this.adashtaHost && !isRelativeUrl(this.adashtaHost)) {
      console.error('Adashta: Invalid socket host');
    }

    this.adashtaPort = config.adashtaPort || 8080;

    if (this.adashtaPort < 0 || this.adashtaPort > 65535) {
      console.error('Adashta: Invalid socket port');
    }

    const chartJsScriptElement = document.createElement('script');
    chartJsScriptElement.setAttribute('src', chartJsScriptUrl);
    document.body.appendChild(chartJsScriptElement);

    const ws = new WebSocket(`ws://${this.adashtaHost}:${this.adashtaPort}`);

    chartJsScriptElement.onload = () => {
      this.initiate(ws);
    };
  }


  

  initiate(ws) {
    setTimeout(() => {
      ws.send(JSON.stringify({
          message: `This is message is from client`
      }));
    }, 1000);
    
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      this.consume(data);
    });
  }

  consume(data) {
    if(data.chartData) {
      this.renderChart(data);
    }
  }

  renderChart(data) {
    if(Object.keys(this.chartData).includes(data.chartId)) {
  
      this.chartData[data.chartId].data.labels = data.chartData.data.labels;
      this.chartData[data.chartId].options = data.chartData.options;

      for (let i=0; i<data.chartData.data.datasets.length; i++) {
        if(this.chartData[data.chartId].data.datasets[i]) {
          this.chartData[data.chartId].data.datasets[i].data = data.chartData.data.datasets[i].data;
        }
        else {
          this.chartData[data.chartId].data.datasets[i] = data.chartData.data.datasets[i];
        }
      }
      
      this.chartData[data.chartId].update();
    }
    else {
      this.chartData[data.chartId] = new Chart(document.querySelectorAll(data.querySelector)[0], data.chartData);
    }
  }
}


const isRelativeUrl = (urlString) => {
  const RgExp = new RegExp('^(?:[a-z]+:)?//', 'i');
  if (RgExp.test(urlString)) {
    return false;
  } else {
    return true;
  }
};
