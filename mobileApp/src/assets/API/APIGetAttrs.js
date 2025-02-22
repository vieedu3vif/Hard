const jwtToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkdWNtaW5ocGhvY29AZ21haWwuY29tIiwidXNlcklkIjoiMDgyOTQxNzAtOWMyMS0xMWVmLWI1YTgtZWQxYWVkOWE2NTFmIiwic2NvcGVzIjpbIlRFTkFOVF9BRE1JTiJdLCJzZXNzaW9uSWQiOiI1MjM2NmQyMy1kNGJiLTQyZDMtOWUxYi04ZDMxYzA5NmRiMmUiLCJleHAiOjE3MzQ0OTgwNzQsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzMyNjk4MDc0LCJmaXJzdE5hbWUiOiJuZ3V5ZW4iLCJsYXN0TmFtZSI6ImR1YyBtaW5oIiwiZW5hYmxlZCI6dHJ1ZSwicHJpdmFjeVBvbGljeUFjY2VwdGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiMDZhYzY1NzAtOWMyMS0xMWVmLWI1YTgtZWQxYWVkOWE2NTFmIiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCJ9.fpAoudKBxKs2oDeXf_qwH407PdlUHULzsPTtmSvJthgZlJugWfRqJQqGRemoDd-00NfNoQLz6pBShChwrEwMxA";


const fetchLatestTelemetryDataDevice = async (deviceId) => {
    try {
  
        const response = await fetch(`http://demo.thingsboard.io/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
  
          return  data;
        } else {
          console.error(`Failed to fetch latest telemetry data for device ${deviceId}`);
        }
      
  
    } catch (error) {
      console.error('Error fetching latest telemetry data:', error);
    }
  };
  
export default fetchLatestTelemetryDataDevice;