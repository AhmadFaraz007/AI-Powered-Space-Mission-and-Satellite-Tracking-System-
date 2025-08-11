import React, { useState, useEffect } from 'react';

const TrackingManage = () => {
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingRecords = async () => {
      try {
        const response = await fetch('http://localhost:8000/satellite_tracking/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Sort by timestamp if available, otherwise just take the latest few
        setTrackingRecords(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch tracking records:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchTrackingRecords();
  }, []);

  if (loading) {
    return <div className="pt-14 p-6 text-white nasa-bg min-h-screen">Loading tracking data...</div>;
  }

  if (error) {
    return <div className="pt-14 p-6 text-red-500 nasa-bg min-h-screen">Error: {error.message}</div>;
  }

  return (
    <div className="pt-14 p-6 text-white nasa-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Satellite Tracking Management</h1>

        <div className="space-y-8">
          {/* Recent Tracking Activity Section */}
          <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">Recent Tracking Activity</h2>
            {trackingRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trackingRecords.slice(0, 3).map((record) => (
                  <div key={record.track_id} className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white">Track ID: {record.track_id}</h3>
                    <p className="text-gray-300">Satellite ID: {record.satellite_id}</p>
                    <p className="text-gray-300">Station ID: {record.station_id}</p>
                    <p className="text-gray-300">Timestamp: {new Date(record.timestamp).toLocaleString()}</p>
                    <p className="text-gray-300">Lat: {record.latitude?.toFixed(2)}, Lon: {record.longitude?.toFixed(2)}</p>
                    <p className="text-gray-300">Alt: {record.altitude_km?.toFixed(2)} km</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No recent tracking records available.</p>
            )}
          </div>

          {/* Placeholder for other tracking content/table */}
          <div className="bg-gray-800/80 rounded-lg p-4 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4">All Tracking Records</h2>
            <p>Full table of all tracking records will go here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingManage; 