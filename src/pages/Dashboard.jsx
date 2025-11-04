import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Dashboard() {
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    activeConversations: 0
  });
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Get conversations count
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      // Get messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Get active conversations
      const { count: activeCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get recent conversations
      const { data: recentConversations } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false })
        .limit(10);

      setStats({
        totalConversations: conversationsCount || 0,
        totalMessages: messagesCount || 0,
        activeConversations: activeCount || 0
      });

      setConversations(recentConversations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl">🏥</span>
        <h1 className="text-4xl font-bold">Clinic Patient Communication Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Patient Inquiries</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalConversations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Messages</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalMessages}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Conversations</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.activeConversations}</p>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Patient Conversations</h2>
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <p className="text-gray-500">No patient inquiries yet</p>
          ) : (
            conversations.map((conv) => (
              <div key={conv.id} className="border-b pb-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{conv.customer_name || 'Patient'}</p>
                    <p className="text-sm text-gray-500">{conv.customer_phone}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      conv.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conv.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.last_message_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
