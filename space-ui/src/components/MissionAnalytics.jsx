import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const MissionAnalytics = ({ missions }) => {
  // Calculate mission statistics
  const statusData = missions.reduce((acc, mission) => {
    acc[mission.status] = (acc[mission.status] || 0) + 1;
    return acc;
  }, {});

  const typeData = missions.reduce((acc, mission) => {
    acc[mission.mission_type] = (acc[mission.mission_type] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data format
  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value,
  }));

  const typeChartData = Object.entries(typeData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Calculate total missions
  const totalMissions = missions.length;

  return (
    <div className="bg-gray-800/80 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-2xl font-semibold mb-6 text-center">Mission Analytics</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <h4 className="text-gray-400 text-sm mb-1">Total Missions</h4>
          <p className="text-3xl font-bold text-blue-400">{totalMissions}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <h4 className="text-gray-400 text-sm mb-1">Active Missions</h4>
          <p className="text-3xl font-bold text-green-400">{statusData['Active'] || 0}</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <h4 className="text-gray-400 text-sm mb-1">Completed Missions</h4>
          <p className="text-3xl font-bold text-blue-400">{statusData['Completed'] || 0}</p>
        </div>
      </div>

      {/* Charts in horizontal layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-lg font-medium mb-4 text-center">Missions by Status</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fill: 'white', fontSize: '14px' }}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  itemStyle={{ color: 'white' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: 'white' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-lg font-medium mb-4 text-center">Missions by Type</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fill: 'white', fontSize: '14px' }}
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  itemStyle={{ color: 'white' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: 'white' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionAnalytics; 