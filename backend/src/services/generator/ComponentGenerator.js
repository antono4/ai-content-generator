/**
 * ComponentGenerator - Generates micro-apps dynamically based on user needs
 */

import { v4 as uuidv4 } from 'uuid';

export class ComponentGenerator {
  constructor(options = {}) {
    this.aiKernel = options.aiKernel;
    this.styles = new StyleSynthesizer();
  }

  async generate(description, requirements = [], context = {}) {
    // Generate component using AI
    const prompt = this.buildGenerationPrompt(description, requirements, context);
    
    let componentCode = '';
    let styleCode = '';
    let metadata = {};

    try {
      const response = await this.aiKernel.process(prompt, context);
      
      if (response.success) {
        const parsed = this.parseComponentResponse(response.response);
        componentCode = parsed.code;
        styleCode = parsed.styles;
        metadata = parsed.metadata;
      } else {
        throw new Error('AI generation failed');
      }
    } catch (error) {
      console.error('Component generation error:', error);
      throw error;
    }

    return {
      id: uuidv4(),
      name: metadata.name || description.split(' ').slice(0, 3).join(' '),
      type: this.detectComponentType(componentCode),
      code: componentCode,
      styles: styleCode,
      metadata,
      createdAt: Date.now(),
    };
  }

  buildGenerationPrompt(description, requirements, context) {
    const requirementsList = requirements.length > 0
      ? requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')
      : 'None specified';

    const contextInfo = Object.keys(context).length > 0
      ? `Context: ${JSON.stringify(context)}`
      : '';

    return `
Generate a React/HTML component for AetherOS based on the following description:

Description: ${description}

Requirements:
${requirementsList}

${contextInfo}

Generate a complete, working component with:
1. React functional component (JSX) with proper state management
2. Inline styles or CSS-in-JS
3. Proper event handlers
4. Responsive design
5. AetherOS visual theme (dark mode, cyan/magenta accents)

Return the response in this JSON format:
{
  "name": "ComponentName",
  "code": "// JSX/React component code",
  "styles": "// CSS styles",
  "metadata": {
    "description": "...",
    "features": ["..."]
  }
}
`;
  }

  parseComponentResponse(response) {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*"code"[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Fall through to code extraction
      }
    }

    // Extract code blocks
    const codeMatch = response.match(/```(?:jsx|javascript|react)?\s*([\s\S]*?)```/g);
    const styleMatch = response.match(/```css\s*([\s\S]*?)```/);

    let code = '';
    let styles = '';

    if (codeMatch) {
      code = codeMatch
        .map((block) => block.replace(/```(?:jsx|javascript|react)?\s*/g, '').replace(/```$/g, ''))
        .join('\n');
    }

    if (styleMatch) {
      styles = styleMatch[1];
    }

    // Extract name
    const nameMatch = response.match(/"name"\s*:\s*"([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : 'Generated Component';

    return {
      name,
      code: code || response,
      styles: styles || this.styles.generateDefault(),
      metadata: {},
    };
  }

  detectComponentType(code) {
    if (code.includes('useState') || code.includes('useEffect') || code.includes('React')) {
      return 'react';
    }
    if (code.includes('<div') || code.includes('<span') || code.includes('class=')) {
      return 'html';
    }
    if (code.includes('fetch') || code.includes('XMLHttpRequest')) {
      return 'dynamic';
    }
    return 'static';
  }

  // Generate preset components
  generatePreset(type) {
    const presets = {
      button: this.generateButtonPreset(),
      card: this.generateCardPreset(),
      form: this.generateFormPreset(),
      list: this.generateListPreset(),
      modal: this.generateModalPreset(),
    };

    return presets[type] || presets.card;
  }

  generateButtonPreset() {
    return {
      id: 'preset-button',
      name: 'Aether Button',
      type: 'react',
      code: `
function AetherButton({ children, onClick, variant = 'primary' }) {
  const [hover, setHover] = useState(false);
  
  const styles = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: variant === 'primary' 
      ? 'linear-gradient(135deg, #00ffff, #00aa88)'
      : 'transparent',
    color: variant === 'primary' ? '#000' : '#00ffff',
    border: variant === 'primary' ? 'none' : '1px solid #00ffff',
    transform: hover ? 'scale(1.05)' : 'scale(1)',
  };

  return (
    <button
      style={styles}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
}
`,
      styles: '',
      metadata: { preset: true },
    };
  }

  generateCardPreset() {
    return {
      id: 'preset-card',
      name: 'Aether Card',
      type: 'react',
      code: `
function AetherCard({ title, content, onAction }) {
  const [expanded, setExpanded] = useState(false);

  const cardStyle = {
    background: 'rgba(15, 15, 25, 0.95)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '400px',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)',
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ color: '#00ffff', marginBottom: '12px' }}>{title}</h3>
      <p style={{ color: '#ccc' }}>{content}</p>
      <button 
        onClick={() => setExpanded(!expanded)}
        style={{
          marginTop: '12px',
          padding: '8px 16px',
          background: 'transparent',
          border: '1px solid #00ffff',
          borderRadius: '6px',
          color: '#00ffff',
          cursor: 'pointer'
        }}
      >
        {expanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
}
`,
      styles: '',
      metadata: { preset: true },
    };
  }

  generateFormPreset() {
    return {
      id: 'preset-form',
      name: 'Aether Form',
      type: 'react',
      code: `
function AetherForm({ onSubmit }) {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
      <input
        style={inputStyle}
        placeholder="Name"
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input
        style={inputStyle}
        placeholder="Email"
        type="email"
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <textarea
        style={{ ...inputStyle, minHeight: '100px' }}
        placeholder="Message"
        onChange={(e) => setFormData({...formData, message: e.target.value})}
      />
      <button
        type="submit"
        style={{
          width: '100%',
          padding: '14px',
          background: 'linear-gradient(135deg, #00ffff, #00aa88)',
          border: 'none',
          borderRadius: '8px',
          color: '#000',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Submit
      </button>
      {submitted && <p style={{ color: '#00ff88', marginTop: '12px' }}>Submitted!</p>}
    </form>
  );
}
`,
      styles: '',
      metadata: { preset: true },
    };
  }

  generateListPreset() {
    return {
      id: 'preset-list',
      name: 'Aether List',
      type: 'react',
      code: `
function AetherList({ items = [] }) {
  const [selected, setSelected] = useState(null);

  const containerStyle = {
    background: 'rgba(15, 15, 25, 0.95)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden',
  };

  const itemStyle = (index) => ({
    padding: '16px',
    borderBottom: index < items.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
    background: selected === index ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
    cursor: 'pointer',
    transition: 'background 0.2s',
  });

  return (
    <div style={containerStyle}>
      {items.map((item, index) => (
        <div
          key={index}
          style={itemStyle(index)}
          onClick={() => setSelected(index)}
          onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.target.style.background = selected === index ? 'rgba(0, 255, 255, 0.1)' : 'transparent'}
        >
          <h4 style={{ color: '#fff', margin: '0 0 4px 0' }}>{item.title}</h4>
          <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
`,
      styles: '',
      metadata: { preset: true },
    };
  }

  generateModalPreset() {
    return {
      id: 'preset-modal',
      name: 'Aether Modal',
      type: 'react',
      code: `
function AetherModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    background: 'rgba(15, 15, 25, 0.95)',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 0 60px rgba(0, 255, 255, 0.15)',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ color: '#00ffff', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
`,
      styles: '',
      metadata: { preset: true },
    };
  }
}

export class StyleSynthesizer {
  generateDefault() {
    return `
.aether-theme {
  --aether-primary: #00ffff;
  --aether-secondary: #ff00ff;
  --aether-accent: #00ff88;
  --aether-bg: #0a0a0f;
  --aether-surface: rgba(15, 15, 25, 0.95);
  --aether-border: rgba(0, 255, 255, 0.3);
  --aether-glow: rgba(0, 255, 255, 0.1);
  --aether-text: #ffffff;
  --aether-text-secondary: #888888;
}

.aether-button-primary {
  background: linear-gradient(135deg, var(--aether-primary), var(--aether-accent));
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.aether-button-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px var(--aether-glow);
}
`;
  }
}

export default ComponentGenerator;
