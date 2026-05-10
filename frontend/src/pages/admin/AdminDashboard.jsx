import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin.api';
import { FaUsers, FaServer, FaDatabase, FaShieldAlt, FaSearch, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [u, h] = await Promise.all([
          adminAPI.getAllUsers(),
          adminAPI.getSystemHealth().catch(() => ({ data: null })),
        ]);
        setUsers(u.data?.users || []);
        setHealth(h.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) { console.error(err); }
  };

  const filtered = users.filter(u => {
    if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && !u.roles?.includes(roleFilter)) return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-heading font-bold text-neutral-800">Admin Dashboard</h1>

      {/* System Health */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: FaServer, label: 'API Status', value: health.status || 'OK', color: 'text-success', bg: 'bg-success/10' },
            { icon: FaDatabase, label: 'Database', value: health.database || 'Connected', color: 'text-secondary', bg: 'bg-secondary/10' },
            { icon: FaUsers, label: 'Total Users', value: users.length, color: 'text-primary-light', bg: 'bg-primary/10' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-fun rounded-2xl p-6">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={s.color} size={20} /></div>
              <div className="text-2xl font-bold text-neutral-800">{s.value}</div>
              <div className="text-neutral-500 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* User Management */}
      <div>
        <h2 className="text-xl font-heading font-bold text-neutral-800 mb-4 flex items-center gap-2"><FaShieldAlt className="text-primary-light" /> User Management</h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 placeholder-dark-400 focus:outline-none focus:border-primary text-sm" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-3 rounded-xl bg-neutral-100 border border-dark-600 text-neutral-800 text-sm focus:outline-none focus:border-primary">
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="INSTRUCTOR">Instructors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <div className="card-fun rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-neutral-500 font-medium">User</th>
                  <th className="text-left p-4 text-neutral-500 font-medium">Role</th>
                  <th className="text-left p-4 text-neutral-500 font-medium">Status</th>
                  <th className="text-right p-4 text-neutral-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-neutral-800 text-sm font-bold">{u.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className="text-neutral-800 font-medium">{u.name}</div>
                          <div className="text-neutral-500 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map(r => (
                          <span key={r} className={`px-2 py-0.5 rounded text-xs font-bold ${r === 'ADMIN' ? 'bg-danger/20 text-danger' : r === 'INSTRUCTOR' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary-light'}`}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.isActive ? 'bg-success/20 text-success' : 'bg-dark-600 text-dark-400'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleToggleStatus(u._id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${u.isActive ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'bg-success/10 text-success hover:bg-success/20'}`}>
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-8 text-dark-400">No users found</div>}
        </div>
      </div>
    </div>
  );
}
