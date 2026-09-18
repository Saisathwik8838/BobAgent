import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Save, Check, AlertCircle, Globe, Linkedin, Github, MapPin, Phone } from 'lucide-react';

export const Profile = ({ initialProfile, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    headline: '',
    summary: '',
    location: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        headline: initialProfile.headline || '',
        summary: initialProfile.summary || '',
        location: initialProfile.location || '',
        phone: initialProfile.phone || '',
        linkedin_url: initialProfile.linkedin_url || '',
        github_url: initialProfile.github_url || '',
        portfolio_url: initialProfile.portfolio_url || '',
      });
    }
  }, [initialProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await api.updateProfile(formData);
      onProfileUpdated(updated);
      setSuccessMessage('Candidate profile updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em' }}>
            Candidate Profile
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Define your verified baseline attributes. This data serves as ground truth evidence for AI matching.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="alert-box alert-success">
          <Check style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert-box alert-danger">
          <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Professional Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. Lead Machine Learning Engineer | Distributed Systems"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Executive Career Summary</label>
            <textarea
              rows={4}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Provide a factual overview of your background, core domains, and impact..."
              className="form-input"
              style={{ resize: 'none' }}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <MapPin style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                  <span>Location</span>
                </span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State / Country or Remote"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Phone style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
                  <span>Phone</span>
                </span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 012-3456"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Linkedin style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                  <span>LinkedIn URL</span>
                </span>
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Github style={{ width: '14px', height: '14px', color: 'var(--text-secondary)' }} />
                  <span>GitHub URL</span>
                </span>
              </label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/username"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Globe style={{ width: '14px', height: '14px', color: 'var(--brand-primary)' }} />
                  <span>Portfolio URL</span>
                </span>
              </label>
              <input
                type="url"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://portfolio.dev"
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.625rem 1.5rem' }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
