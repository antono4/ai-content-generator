/**
 * CommandPalette - AI command input interface
 */

import React, { useState, useRef, useEffect } from 'react';

const CommandPalette = ({ onSubmit, isProcessing, providers }) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  
  const suggestions = [
    'Create a task for tomorrow',
    'Show my recent files',
    'Generate an image',
    'Start a POS system',
    'Connect to my database',
    'Write a Python script',
    'Analyze this code',
    'Book a meeting room',
  ];
  
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(input.toLowerCase())
  );
  
  useEffect(() => {
    // Keyboard shortcut to focus
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsExpanded(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsExpanded(false);
        setShowSuggestions(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSubmit(input);
      setInput('');
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
    setShowSuggestions(false);
  };
  
  const getProviderColor = (status) => {
    switch (status) {
      case 'connected': return '#00ff88';
      case 'error': return '#ff4444';
      default: return '#888888';
    }
  };
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: isExpanded ? '600px' : '500px',
        maxWidth: '90vw',
      }}
    >
      {/* Provider status bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          padding: '0 12px',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          {Object.entries(providers).map(([name, status]) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#888',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getProviderColor(status),
                }}
              />
              {name.toUpperCase()}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          Press ⌘K to toggle
        </div>
      </div>
      
      {/* Command input */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            position: 'relative',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(0, 255, 255, 0.1)',
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.05) 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '16px' }}>
            {/* AI icon */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(input.length > 0)}
              placeholder="What would you like to do?"
              disabled={isProcessing}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '16px',
                fontFamily: 'Inter, -apple-system, sans-serif',
              }}
            />
            
            {isProcessing && (
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(0, 255, 255, 0.3)',
                  borderTopColor: '#00ffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginLeft: '12px',
                }}
              />
            )}
            
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              style={{
                background: input.trim() && !isProcessing 
                  ? 'linear-gradient(135deg, #00ffff, #00aa88)' 
                  : '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: input.trim() && !isProcessing ? 'pointer' : 'not-allowed',
                marginLeft: '12px',
                transition: 'all 0.2s',
              }}
            >
              Send
            </button>
          </div>
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    color: '#ccc',
                    fontSize: '14px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CommandPalette;
