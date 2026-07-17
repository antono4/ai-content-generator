/**
 * SandboxRunner - Safely executes generated code in isolation
 */

export class SandboxRunner {
  constructor(options = {}) {
    this.timeout = options.timeout || 5000;
    this.allowedAPIs = new Set([
      'console.log',
      'console.warn',
      'console.error',
      'Math',
      'Date',
      'JSON',
      'Array',
      'Object',
      'String',
      'Number',
      'Boolean',
      'Promise',
      'setTimeout',
      'clearTimeout',
      'fetch',
    ]);
    this.dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /__proto__/,
      /constructor/,
      /prototype/,
      /localStorage/,
      /sessionStorage/,
      /document\./,
      /window\./,
      /location\./,
      /navigator\./,
      /import\s*\(/,
      /require\s*\(/,
      /import\.meta/,
      /process\./,
      /global\./,
    ];
  }

  validate(code) {
    const errors = [];

    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(`Dangerous pattern detected: ${pattern.toString()}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async execute(code, context = {}) {
    const validation = this.validate(code);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Code validation failed',
        details: validation.errors,
      };
    }

    try {
      // Create sandboxed environment
      const result = await this.executeInSandbox(code, context);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  async executeInSandbox(code, context) {
    return new Promise((resolve, reject) => {
      // Create iframe sandbox
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.sandbox = 'allow-scripts';
      
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Execution timeout'));
      }, this.timeout);

      const cleanup = () => {
        clearTimeout(timeoutId);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };

      // Set up message handler
      const handleMessage = (event) => {
        if (event.source !== iframe.contentWindow) return;
        
        cleanup();
        window.removeEventListener('message', handleMessage);
        
        const { type, data, error } = event.data;
        
        if (type === 'result') {
          resolve(data);
        } else if (type === 'error') {
          reject(new Error(error));
        }
      };

      window.addEventListener('message', handleMessage);

      // Build sandboxed code
      const sandboxedCode = `
        try {
          const context = ${JSON.stringify(context)};
          const result = (function() {
            ${code}
          })();
          
          parent.postMessage({ type: 'result', data: result }, '*');
        } catch (error) {
          parent.postMessage({ type: 'error', error: error.message }, '*');
        }
      `;

      iframe.srcdoc = `<!DOCTYPE html><html><head></head><body><script>${sandboxedCode}</script></body></html>`;
      document.body.appendChild(iframe);
    });
  }

  async executeReact(code, targetElementId) {
    // For React components, wrap them properly
    const wrappedCode = `
      (function() {
        const { useState, useEffect, useRef } = React;
        
        ${code}
        
        return { Component };
      })()
    `;

    return this.execute(wrappedCode);
  }

  // Generate standalone HTML from component
  generateHTML(component, styles = '') {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${component.name || 'AetherOS App'}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0a0a0f;
      color: #fff;
      padding: 20px;
    }
    ${styles}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${component.code}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
    `.trim();
  }
}

export default SandboxRunner;
