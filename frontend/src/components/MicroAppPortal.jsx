/**
 * MicroAppPortal - Renders dynamically generated micro-apps
 */

import React, { useState, useEffect, useRef } from 'react';

const MicroAppPortal = ({ app, onClose }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  
  useEffect(() => {
    if (app) {
      renderApp(app);
    }
  }, [app]);
  
  const renderApp = async (appData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (appData.type === 'iframe') {
        setContent({ type: 'iframe', url: appData.url });
      } else if (appData.type === 'component') {
        setContent({ type: 'component', code: appData.code, styles: appData.styles });
      } else if (appData.type === 'html') {
        // Render HTML in sandboxed iframe
        setContent({ type: 'html', html: appData.html });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const generateIframeContent = () => {
    if (!content || content.type !== 'html') return '';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              background: #0a0a0f;
              color: #fff;
              overflow: hidden;
            }
            ${content.html.styles || ''}
          </style>
        </head>
        <body>
          ${content.html.body}
          <script>
            ${content.html.script || ''}
          </script>
        </body>
      </html>
    `;
  };
  
  if (!app) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '90vw',
          height: '85vh',
          maxWidth: '1400px',
          background: 'rgba(15, 15, 25, 0.95)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 60px rgba(0, 255, 255, 0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
              }}
            />
            <span style={{ fontWeight: 600, fontSize: '16px' }}>{app.name || 'Generated App'}</span>
            <span style={{ color: '#666', fontSize: '12px' }}>AI Generated</span>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Close
          </button>
        </div>
        
        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid rgba(0, 255, 255, 0.2)',
                  borderTopColor: '#00ffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span style={{ color: '#888' }}>Generating application...</span>
            </div>
          )}
          
          {error && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
                color: '#ff4444',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Error: {error}</span>
            </div>
          )}
          
          {!loading && !error && content && (
            <>
              {content.type === 'iframe' && (
                <iframe
                  src={content.url}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  sandbox="allow-scripts allow-same-origin"
                />
              )}
              
              {content.type === 'html' && (
                <iframe
                  ref={iframeRef}
                  srcDoc={generateIframeContent()}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  sandbox="allow-scripts"
                />
              )}
              
              {content.type === 'component' && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    padding: '24px',
                  }}
                >
                  <style>{content.styles}</style>
                  <div dangerouslySetInnerHTML={{ __html: content.code }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MicroAppPortal;
