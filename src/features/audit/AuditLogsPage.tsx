import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Audit Logs | BlogForge Admin";
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setError('');
    try {
      const response = await apiClient.get('/admin/audit-logs');
      setLogs(response.data.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return <Badge className="bg-green-500">CREATE</Badge>;
      case 'UPDATE': return <Badge className="bg-blue-500">UPDATE</Badge>;
      case 'DELETE': return <Badge className="bg-red-500">DELETE</Badge>;
      case 'UPDATE_STATUS': return <Badge className="bg-yellow-500">UPDATE_STATUS</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading audit logs...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-gray-500">Track sensitive actions in the system.</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border-2 border-red-200 sharp-corners p-2 font-mono text-xs">
          {error}
        </div>
      )}

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>{log.user?.name || 'System'}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    {log.entity_type} {log.entity_id && <span className="text-xs text-gray-400">({log.entity_id.substring(0,8)}...)</span>}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={log.new_values}>
                    {log.new_values}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
