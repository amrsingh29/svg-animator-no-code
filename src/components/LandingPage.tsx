"use client";

import Link from "next/link";
import React from "react";

export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '20px', color: '#111827' }}>
                        <div style={{ width: '28px', height: '28px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: '14px', height: '14px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                        </div>
                        SVG Animator
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/login" style={{ padding: '8px 16px', color: '#374151', fontSize: '15px', fontWeight: 600, textDecoration: 'none', borderRadius: '24px', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        Log in
                    </Link>
                    <Link href="/signup" style={{ padding: '8px 20px', backgroundColor: '#60a5fa', color: '#ffffff', fontSize: '15px', fontWeight: 600, textDecoration: 'none', borderRadius: '24px', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(96, 165, 250, 0.3)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#60a5fa'}>
                        Sign up
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center' }}>

                {/* Avatar Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-12px', marginBottom: '32px' }}>
                    {['#fcd34d', '#f87171', '#c084fc', '#60a5fa', '#34d399'].map((color, i) => (
                        <div key={i} style={{
                            width: '48px', height: '48px',
                            backgroundColor: color,
                            borderRadius: '50%',
                            border: '3px solid #f9f9f9',
                            marginLeft: '-12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 10 - i
                        }}>
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%', transform: 'translateY(-4px)' }}></div>
                        </div>
                    ))}
                </div>

                <h1 style={{ fontSize: '56px', fontWeight: 800, color: '#111827', marginBottom: '16px', letterSpacing: '-1.5px', maxWidth: '800px', lineHeight: 1.1 }}>
                    Turn ideas into <br />beautiful SVG animations
                </h1>

                <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '48px', maxWidth: '600px', lineHeight: 1.5 }}>
                    AI agents to map paths, morph shapes, and build SVG sequences.
                    <br />In minutes. Without coding.
                </p>

            </main>
        </div>
    );
}
