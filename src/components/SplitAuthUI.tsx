"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import React from "react";

export default function SplitAuthUI({ mode }: { mode: 'login' | 'signup' }) {
    const isLogin = mode === 'login';
    const title = isLogin ? "Welcome Back" : "Get Started";
    const primaryButtonText = isLogin ? "Log in with Google" : "Sign up with Google";
    const bottomText = isLogin ? "Don't have an account?" : "Already have an account?";
    const bottomLinkText = isLogin ? "Sign up" : "Log in";
    const bottomLinkHref = isLogin ? "/signup" : "/login";

    return (
        <div style={{ display: 'flex', width: "100vw", height: "100vh", backgroundColor: '#09090b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Left Column (Auth) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative' }}>
                <Link href="/" style={{ position: 'absolute', top: '40px', left: '40px', color: '#a1a1aa', fontSize: '24px', cursor: 'pointer', textDecoration: 'none' }}>←</Link>
                <div style={{ width: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '32px', color: '#f4f4f5' }}>{title}</h1>

                    <button
                        onClick={() => signIn("google", { callbackUrl: '/' })}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '12px 24px', backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f4f4f5', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        {primaryButtonText}
                    </button>

                    <div style={{ marginTop: '24px' }}>
                        <p style={{ textAlign: 'center', fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
                            {bottomText} <Link href={bottomLinkHref} style={{ color: '#f4f4f5', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>{bottomLinkText}</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column (Hero) */}
            <div style={{ flex: 1, backgroundColor: '#18181b', borderLeft: '1px solid #27272a', borderTopLeftRadius: '32px', borderBottomLeftRadius: '32px', padding: '64px', color: '#f4f4f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundImage: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(249, 115, 22, 0.05), transparent 50%)' }}>
                <div style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', backgroundColor: '#27272a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #3f3f46' }}>
                        <div style={{ width: '14px', height: '14px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: '#f4f4f5' }}>SVG Animator</span>
                </div>

                <div style={{ zIndex: 10, maxWidth: '460px' }}>
                    <h2 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '32px', lineHeight: 1.2, letterSpacing: '-1px', color: '#ffffff' }}>Turn ideas into animations instantly</h2>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '18px', fontWeight: 600, color: '#e4e4e7' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#27272a', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, border: '1px solid #3f3f46' }}>✓</div>
                            Minutes instead of weeks
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#27272a', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, border: '1px solid #3f3f46' }}>✓</div>
                            Generate actual SVGs, not just videos
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#27272a', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, border: '1px solid #3f3f46' }}>✓</div>
                            Seamless morphing and CSS generation
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#27272a', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, border: '1px solid #3f3f46' }}>✓</div>
                            Custom workflow canvas built for creators
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
