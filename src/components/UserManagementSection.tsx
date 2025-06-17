import React, { useState } from 'react';
import { UserPlus, Mail, Send, Users, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { User } from '../types';

interface UserManagementSectionProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
}

const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  users,
  setUsers,
  currentUser
}) => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsProcessing(true);

    try {
      // Validate input
      if (!newUser.name.trim()) {
        setError('Please enter a name');
        setIsProcessing(false);
        return;
      }

      if (!newUser.email.trim()) {
        setError('Please enter an email address');
        setIsProcessing(false);
        return;
      }

      // Check if email already exists
      if (users.some(user => user.email.toLowerCase() === newUser.email.toLowerCase())) {
        setError('A user with this email already exists');
        setIsProcessing(false);
        return;
      }

      // Create new user
      const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
      const userToCreate: User = {
        id: maxId + 1,
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: 'user123', // Default password
        role: newUser.role,
        availability: true
      };

      setUsers([...users, userToCreate]);

      // Simulate sending invite email
      setTimeout(() => {
        setSuccess(`Invite sent successfully to ${newUser.email}! Default password: user123`);
        setNewUser({ name: '', email: '', role: 'user' });
        setShowCreateUser(false);
        setIsProcessing(false);
      }, 1000);

    } catch (error) {
      setError('Failed to create user. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
      setSuccess('User deleted successfully');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <UserPlus className="w-6 h-6 text-blue-400" />
            <span>User Management</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Create new users and send account invites
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateUser(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-200">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Users List */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h4 className="text-lg font-semibold text-white">All Users ({filteredUsers.length})</h4>
        </div>
        
        <div className="divide-y divide-gray-700">
          {filteredUsers.map(user => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                }`}>
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-white">{user.name}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                    {user.id === currentUser.id && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${user.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-500">
                      {user.availability ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // Simulate sending invite
                    setSuccess(`Invite resent to ${user.email}`);
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                  title="Resend Invite"
                >
                  <Send size={16} />
                </button>
                
                {user.id !== currentUser.id && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No users found matching your search.</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="john.doe@company.com"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'user' | 'admin'})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User (Candidate)</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-gray-500 text-xs mt-1">Default password will be: user123</p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUser(false);
                    setNewUser({ name: '', email: '', role: 'user' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementSection;