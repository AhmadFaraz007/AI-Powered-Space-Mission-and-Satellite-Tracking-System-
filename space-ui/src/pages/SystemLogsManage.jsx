import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SystemLogsTable from '../components/SystemLogsTable';
import SystemLogsFormModal from '../components/SystemLogsFormModal';
import { motion } from 'framer-motion';

const SystemLogsManage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLogRecord, setCurrentLogRecord] = useState({
    log_message: '',
    log_level: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/logs/');
      setLogs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch logs. Please try again later.');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLogRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (currentLogRecord.log_id) {
        await axios.put(`http://localhost:8000/logs/${currentLogRecord.log_id}`, currentLogRecord);
      } else {
        await axios.post('http://localhost:8000/logs/', currentLogRecord);
      }
      await fetchLogs();
      setIsModalOpen(false);
      setCurrentLogRecord({ log_message: '', log_level: '' });
    } catch (err) {
      setError('Failed to save log. Please try again.');
      console.error('Error saving log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (log) => {
    setCurrentLogRecord(log);
    setIsModalOpen(true);
  };

  const handleDelete = async (logId) => {
    setLogToDelete(logId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/logs/${logToDelete}`);
      await fetchLogs();
      setShowDeleteConfirm(false);
      setLogToDelete(null);
    } catch (err) {
      setError('Failed to delete log. Please try again.');
      console.error('Error deleting log:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      await fetchLogs();
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/logs/${searchId}`);
      setLogs([response.data]);
      setError(null);
    } catch (err) {
      setError('Log not found. Please try a different ID.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 p-6 text-white nasa-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">System Logs Management</h1>

        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => {
              setCurrentLogRecord({ log_message: '', log_level: '' });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Add New Log
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Search by Log ID..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Search
            </button>
          </div>
        </div>

        {/* Log Activity Summary Section */}
        <div className="bg-gray-800/80 rounded-lg p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4 text-white">Log Activity Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white">Total Logs</h3>
              <p className="text-3xl font-extrabold text-blue-400">{logs.length}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white">Error Logs</h3>
              <p className="text-3xl font-extrabold text-red-400">{logs.filter(log => log.log_level === 'Error').length}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white">Warning Logs</h3>
              <p className="text-3xl font-extrabold text-yellow-400">{logs.filter(log => log.log_level === 'Warning').length}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white">Info Logs</h3>
              <p className="text-3xl font-extrabold text-green-400">{logs.filter(log => log.log_level === 'Info').length}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-md text-red-200">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <SystemLogsTable
            logs={logs}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <SystemLogsFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentLogRecord={currentLogRecord}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Confirm Delete</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete this log record? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogsManage; 