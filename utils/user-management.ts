import { getConnection } from '../database/connection';

// Check if user is Admin
export async function isAdmin(userId: number): Promise<boolean> {
  try {
    const connection = await getConnection();
    const [rows]: any = await connection.query(
      'SELECT r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND u.is_active = true',
      [userId]
    );
    connection.release();

    return rows.length > 0 && rows[0].role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Get all users (Admin only)
export async function getAllUsers(adminId: number): Promise<any> {
  try {
    const isUserAdmin = await isAdmin(adminId);
    if (!isUserAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const connection = await getConnection();
    const [users]: any = await connection.query(
      'SELECT u.id, u.email, u.name, r.name AS role, u.is_active, u.created_at FROM users u LEFT JOIN roles r ON u.role_id = r.id ORDER BY u.created_at DESC'
    );
    connection.release();

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Update user role (Admin only)
export async function updateUserRole(
  adminId: number,
  targetUserId: number,
  newRole: 'admin' | 'user'
): Promise<any> {
  try {
    const isUserAdmin = await isAdmin(adminId);
    if (!isUserAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const connection = await getConnection();

    // Look up role_id from roles table
    const [roleRows]: any = await connection.query(
      'SELECT id FROM roles WHERE name = ?',
      [newRole]
    );

    if (roleRows.length === 0) {
      connection.release();
      throw new Error(`Invalid role: ${newRole}`);
    }

    const roleId = roleRows[0].id;

    const [result]: any = await connection.execute(
      'UPDATE users SET role_id = ? WHERE id = ? AND id != ?',
      [roleId, targetUserId, adminId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      throw new Error('User not found or cannot modify self');
    }

    return { success: true, message: `User role updated to ${newRole}` };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Deactivate user (Admin only)
export async function deactivateUser(
  adminId: number,
  targetUserId: number
): Promise<any> {
  try {
    const isUserAdmin = await isAdmin(adminId);
    if (!isUserAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const connection = await getConnection();
    const [result]: any = await connection.execute(
      'UPDATE users SET is_active = false WHERE id = ? AND id != ?',
      [targetUserId, adminId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      throw new Error('User not found or cannot deactivate self');
    }

    return { success: true, message: 'User deactivated successfully' };
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
}

// Activate user (Admin only)
export async function activateUser(
  adminId: number,
  targetUserId: number
): Promise<any> {
  try {
    const isUserAdmin = await isAdmin(adminId);
    if (!isUserAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const connection = await getConnection();
    const [result]: any = await connection.execute(
      'UPDATE users SET is_active = true WHERE id = ?',
      [targetUserId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    return { success: true, message: 'User activated successfully' };
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: number): Promise<any> {
  try {
    const connection = await getConnection();
    const [users]: any = await connection.query(
      'SELECT u.id, u.email, u.name, r.name AS role, u.is_active, u.created_at FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [userId]
    );
    connection.release();

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
