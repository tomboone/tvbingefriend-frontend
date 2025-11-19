import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../utils/userApi';

function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Username update
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');

  // Email update
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setNewUsername(user.username || '');
      setNewEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await userApi.updateUsername(newUsername, usernamePassword);
      await refreshUser();
      setUsernamePassword('');
      setMessage({ type: 'success', text: 'Username updated successfully!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    }

    setLoading(false);
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await userApi.updateEmail(newEmail, emailPassword);
      await refreshUser();
      setEmailPassword('');
      setMessage({
        type: 'success',
        text: 'Email updated! Please check your new email to verify it.',
      });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    }

    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'danger', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'danger', text: 'Password must be at least 8 characters long' });
      return;
    }

    setLoading(true);

    try {
      await userApi.updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setMessage({ type: 'success', text: 'Password updated successfully!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
    }

    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await userApi.deleteAccount(deletePassword);
      logout();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    console.log('User object:', user);
    console.log('User email:', user?.email);

    if (!user?.email) {
      setMessage({ type: 'danger', text: 'Email address not found' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Sending resend verification with email:', user.email);
      await userApi.resendVerification(user.email);
      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox.',
      });
    } catch (err) {
      console.error('Resend verification error:', err);
      setMessage({ type: 'danger', text: err.message });
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="alert alert-warning">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-lg-8 mx-auto">
        <h2 className="mb-4">My Profile</h2>

        {message.text && (
          <div className={`alert alert-${message.type}`} role="alert">
            {message.text}
          </div>
        )}

        {/* Profile Info */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Profile Information</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <strong>Username:</strong> {user.username}
            </div>
            <div className="mb-3">
              <strong>Email:</strong> {user.email}{' '}
              {user.email_verified ? (
                <span className="badge bg-success">Verified</span>
              ) : (
                <>
                  <span className="badge bg-warning">Not Verified</span>
                  <button
                    className="btn btn-sm btn-outline-primary ms-2"
                    onClick={handleResendVerification}
                    disabled={loading}
                  >
                    Resend Verification Email
                  </button>
                </>
              )}
            </div>
            <div className="mb-0">
              <strong>Member Since:</strong>{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Update Username */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Update Username</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateUsername}>
              <div className="mb-3">
                <label htmlFor="newUsername" className="form-label">
                  New Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="usernamePassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="usernamePassword"
                  value={usernamePassword}
                  onChange={(e) => setUsernamePassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                Update Username
              </button>
            </form>
          </div>
        </div>

        {/* Update Email */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Update Email</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateEmail}>
              <div className="mb-3">
                <label htmlFor="newEmail" className="form-label">
                  New Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="newEmail"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="emailPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="emailPassword"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                Update Email
              </button>
            </form>
          </div>
        </div>

        {/* Update Password */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Change Password</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-3">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="8"
                />
                <div className="form-text">
                  Must be at least 8 characters long
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="confirmNewPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                Change Password
              </button>
            </form>
          </div>
        </div>

        {/* Delete Account */}
        <div className="card mb-4 border-danger">
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">Danger Zone</h5>
          </div>
          <div className="card-body">
            {!showDeleteConfirm ? (
              <div>
                <p className="mb-3">
                  Once you delete your account, there is no going back. Please be
                  certain.
                </p>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              </div>
            ) : (
              <div>
                <div className="alert alert-warning">
                  <strong>Warning!</strong> This action cannot be undone. All your
                  data will be permanently deleted.
                </div>
                <div className="mb-3">
                  <label htmlFor="deletePassword" className="form-label">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={loading || !deletePassword}
                  >
                    Confirm Delete Account
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
