import React, { useState, useEffect } from "react";
import { loadPyodide } from "pyodide";

function PyodideComponent() {
	const [pyodide, setPyodide] = useState(null);
	const [result, setResult] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function load() {
			try {
				const pyodideInstance = await loadPyodide({
					indexURL: "/pyodide/",
				});
				setPyodide(pyodideInstance);
				setLoading(false);
			} catch (error) {
				console.error("Error loading Pyodide:", error);
			}
		}

		load();
	}, []);

	const runPython = async () => {
		if (pyodide) {
			try {
				const pythonResult = await pyodide.runPythonAsync("1 + 1");
				setResult(pythonResult.toString());
			} catch (error) {
				console.error("Python execution error:", error);
				setResult("Error!");
			}
		}
	};

	if (loading) {
		return <div>Loading Pyodide...</div>;
	}

	return (
		<div>
			<button onClick={runPython}>Run Python</button>
			<p>Result: {result}</p>
		</div>
	);
}

export default PyodideComponent;
