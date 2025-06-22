// Utility to load Pyodide and call Python functions from JS
let pyodide = null;
let pyLoaded = false;

export async function loadPyodideAndScript() {
  if (pyLoaded) return pyodide;
  if (!window.loadPyodide) {
    // Dynamically load Pyodide from CDN
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
  // Load the Python script
  const response = await fetch('py/parse_manual_numbers.py');
  const scriptText = await response.text();
  await pyodide.runPythonAsync(scriptText);
  pyLoaded = true;
  return pyodide;
}

export async function parseManualNumbers(numbersText) {
  await loadPyodideAndScript();
  // Escape triple quotes and backslashes for safe Python string
  const safeText = numbersText.replace(/\\/g, '\\\\').replace(/"""/g, '\"\"\"');
  const pyCode = `import json\nresult = parse_manual_numbers("""${safeText}""")\njson.dumps(result)`;
  const resultJson = await pyodide.runPythonAsync(pyCode);
  return JSON.parse(resultJson);
} 