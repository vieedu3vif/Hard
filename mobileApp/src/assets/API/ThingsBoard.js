import React, { useEffect, useState } from 'react';


const jwtToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkdWNtaW5ocGhvY29AZ21haWwuY29tIiwidXNlcklkIjoiMDgyOTQxNzAtOWMyMS0xMWVmLWI1YTgtZWQxYWVkOWE2NTFmIiwic2NvcGVzIjpbIlRFTkFOVF9BRE1JTiJdLCJzZXNzaW9uSWQiOiIxMTllZmE2OS1hYmJiLTRmYzMtODYyYi00ZjExMGRkMzIwZTEiLCJleHAiOjE3MzI2ODUxMzksImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzMwODg1MTM5LCJmaXJzdE5hbWUiOiJuZ3V5ZW4iLCJsYXN0TmFtZSI6ImR1YyBtaW5oIiwiZW5hYmxlZCI6dHJ1ZSwicHJpdmFjeVBvbGljeUFjY2VwdGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiMDZhYzY1NzAtOWMyMS0xMWVmLWI1YTgtZWQxYWVkOWE2NTFmIiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCJ9.eE7i2EN-fXGgRgytAru8yWiFTXWfMlRAyhR2KdRUnl2W2-WmOhswSDha9J-NX66Zxi5Gv0CmbZ5xMkG1JC3IIg";

const currentTime = new Date();
const oneHourAgo = new Date(currentTime.getTime() - 10 * 60 * 1000);

const startTimestamp = oneHourAgo.getTime();
const endTimestamp = currentTime.getTime();


const ThingsBoard = ({ onDataFetched }) => {
  const [telemetryData, setTelemetryData] = useState({});
  const [historyData, setHistoryData] = useState({});
  const deviceIds = [
    "c7826090-9c28-11ef-b5a8-ed1aed9a651f",
    "f009edb0-9cde-11ef-b5a8-ed1aed9a651f"  
  ];

  
  const fetchLatestTelemetryData = async () => {
    try {
      const allData = {};

      for (let deviceId of deviceIds) {
        const response = await fetch(`http://demo.thingsboard.io/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          allData[deviceId] = data;
        } else {
          console.error(`Failed to fetch latest telemetry data for device ${deviceId}`);
        }
      }

      setTelemetryData(allData);  
      onDataFetched(allData);  

    } catch (error) {
      console.error('Error fetching latest telemetry data:', error);
    }
  };

  
  const fetchHistoricalTelemetryData = async () => {
    try {
      const allHistory = {};

      for (let deviceId of deviceIds) {
        const response = await fetch(`http://demo.thingsboard.io/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=temperature,humidity&startTs=${startTimestamp}&endTs=${endTimestamp}&limit=100`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          allHistory[deviceId] = data;
        } else {
          console.error(`Failed to fetch historical telemetry data for device ${deviceId}`);
        }
      }

      setHistoryData(allHistory); 

    } catch (error) {
      console.error('Error fetching historical telemetry data:', error);
    }
  };

  useEffect(() => {
    fetchHistoricalTelemetryData();

    const intervalId = setInterval(fetchLatestTelemetryData, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
};

export default ThingsBoard;