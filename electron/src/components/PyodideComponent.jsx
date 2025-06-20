import React, { useState, useEffect } from "react";
import { loadPyodide } from "pyodide";

function PyodideComponent() {
	const [pyodide, setPyodide] = useState(null);
	const [result, setResult] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function load() {
			try {
				const indexURL = window.location.origin + "/pyodide/";

				console.log("Loading Pyodide with indexURL:", indexURL);

				const pyodideInstance = await loadPyodide({
					indexURL: indexURL,
				});

				setPyodide(pyodideInstance);
				setLoading(false);
			} catch (error) {
				console.error("Error loading Pyodide:", error);
				setError(error.message);
				setLoading(false);
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

	if (error) {
		return <div>Error loading Pyodide: {error}</div>;
	}

	return (
		<div>
			<button onClick={runPython}>Run Python</button>
			<p>Result: {result}</p>
		</div>
	);
}

export default PyodideComponent;
