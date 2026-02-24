import React, { useState, useEffect } from 'react';
import { Settings, X, Key } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [apiKey, setApiKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Load key from localStorage on mount
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey.trim());
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1500);
    };

    const clearKey = () => {
        localStorage.removeItem('gemini_api_key');
        setApiKey('');
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: 'var(--bg-node)',
                border: '1px solid var(--border-focus)',
                padding: '24px',
                borderRadius: '12px',
                width: '400px',
                maxWidth: '90vw',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                    <Settings size={20} /> Settings
                </h2>

                <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Gemini API Key
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 36px',
                                backgroundColor: 'var(--bg-main)',
                                border: '1px solid var(--border-dim)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                        Your key is stored locally in your browser and is only used to generate SVGs. It is never sent to our database.
                    </p>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                            onClick={clearKey}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-dim)',
                                color: 'var(--text-error)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: isSaved ? 'var(--accent-green)' : 'var(--accent-orange)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 600,
                                transition: 'background-color 0.2s',
                            }}
                        >
                            {isSaved ? 'Saved!' : 'Save Key'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
