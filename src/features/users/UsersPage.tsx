import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: '', username: '', email: '', password: '', role_id: '', status: 'active' 
  });
  const [editError, setEditError] = useState('');
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    document.title = "Users | BlogForge Admin";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/roles')
      ]);
      setUsers(usersRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching users data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        name: user.name, 
        username: user.username, 
        email: user.email, 
        password: '', // Leave blank for edit
        role_id: user.role_id || '', 
        status: user.status 
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', username: '', email: '', password: '', role_id: '', status: 'active' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    try {
      const dataToSubmit = { ...formData };
      if (editingUser && !dataToSubmit.password) {
        delete (dataToSubmit as any).password;
      }
      
      if (editingUser) {
        await apiClient.put(`/admin/users/${editingUser.id}`, dataToSubmit);
      } else {
        await apiClient.post('/admin/users', dataToSubmit);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      setEditError(error.response?.data?.errors || error.response?.data?.message || 'Failed to save user');
    }
  };

  const confirmDelete = (user: any) => {
    setUserToDelete(user);
    setDeleteError('');
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleteError('');
    try {
      await apiClient.delete(`/admin/users/${userToDelete.id}`);
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: any) {
      setDeleteError(error.response?.data?.errors || error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <div className="p-8 font-mono text-xs uppercase tracking-widest">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black font-serif uppercase tracking-tighter">User Management</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">Manage authors and admins</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="sharp-corners bg-accent text-white hover:bg-black">
          + Add New User
        </Button>
      </div>

      <div className="border-2 border-black bg-white sharp-corners">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black bg-neutral-100">
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Name</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Email</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Role</TableHead>
              <TableHead className="font-mono text-xs font-bold uppercase tracking-widest text-black">Status</TableHead>
              <TableHead className="text-right font-mono text-xs font-bold uppercase tracking-widest text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? users.map((user) => (
              <TableRow key={user.id} className="border-b border-black">
                <TableCell className="font-bold">
                  {user.name}
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">@{user.username}</div>
                </TableCell>
                <TableCell className="font-mono text-xs">{user.email}</TableCell>
                <TableCell>
                  <span className="border border-black px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest bg-neutral-100">
                    {user.role?.name || 'Unknown'}
                  </span>
                </TableCell>
                <TableCell>
                  {user.status === 'active' ? (
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-green-600">Active</span>
                  ) : (
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-red-600">Inactive</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)} className="sharp-corners mr-2 font-mono text-xs uppercase tracking-widest hover:text-accent">Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => confirmDelete(user)} className="sharp-corners font-mono text-xs uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sharp-corners border-2 border-black sm:max-w-[425px]">
          <DialogHeader className="border-b-2 border-black pb-4 mb-4">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-tighter">
              {editingUser ? 'Edit User' : 'Create User'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border-2 border-red-200 sharp-corners">
                {editError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs font-bold uppercase tracking-widest">Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                  className="sharp-corners"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="font-mono text-xs font-bold uppercase tracking-widest">Username</Label>
                <Input 
                  id="username" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  required 
                  className="sharp-corners"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs font-bold uppercase tracking-widest">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
                className="sharp-corners font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs font-bold uppercase tracking-widest">
                {editingUser ? 'Password (leave blank to keep)' : 'Password'}
              </Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required={!editingUser} 
                className="sharp-corners"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="font-mono text-xs font-bold uppercase tracking-widest">Role</Label>
                <Select value={formData.role_id} onValueChange={(val) => setFormData({...formData, role_id: val})}>
                  <SelectTrigger className="sharp-corners">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="sharp-corners">
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id} className="font-mono text-xs uppercase">{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="font-mono text-xs font-bold uppercase tracking-widest">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger className="sharp-corners">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="sharp-corners">
                    <SelectItem value="active" className="font-mono text-xs uppercase text-green-600">Active</SelectItem>
                    <SelectItem value="inactive" className="font-mono text-xs uppercase text-red-600">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4 border-t-2 border-black mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="sharp-corners">
                Cancel
              </Button>
              <Button type="submit" className="sharp-corners bg-black hover:bg-accent text-white">
                Save User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sharp-corners border-2 border-black sm:max-w-[425px]">
          <DialogHeader className="border-b-2 border-black pb-4 mb-4">
            <DialogTitle className="font-serif font-black text-2xl uppercase tracking-tighter text-red-600">
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="font-mono text-xs uppercase tracking-widest mt-2 text-black">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete user <span className="font-bold">{userToDelete?.name}</span>?
          </div>
          {deleteError && (
            <div className="px-4 pb-2 text-sm text-red-600 bg-red-50 border-2 border-red-200 sharp-corners p-2">
              {deleteError}
            </div>
          )}
          <DialogFooter className="pt-4 border-t-2 border-black mt-6">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="sharp-corners">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} className="sharp-corners bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
