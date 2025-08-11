import React from 'react';

const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-700 rounded-t-lg mb-4"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="h-16 bg-gray-700 rounded-lg mb-2"></div>
      ))}
    </div>
  );
};

const SystemLogsTable = ({ logs, onEdit, onDelete }) => {
  if (!logs) {
    return <TableSkeleton />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Log ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Message
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Level
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Timestamp
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700">
          {logs.map((log) => (
            <tr key={log.log_id} className="hover:bg-gray-800 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {log.log_id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                {log.log_message}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${log.log_level === 'ERROR' ? 'bg-red-900 text-red-200' : 
                    log.log_level === 'WARNING' ? 'bg-yellow-900 text-yellow-200' : 
                    log.log_level === 'DEBUG' ? 'bg-blue-900 text-blue-200' : 
                    'bg-green-900 text-green-200'}`}>
                  {log.log_level}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(log)}
                  className="text-blue-400 hover:text-blue-300 mr-4 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(log.log_id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SystemLogsTable; 