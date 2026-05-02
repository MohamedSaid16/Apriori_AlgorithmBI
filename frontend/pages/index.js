import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [datasetText, setDatasetText] = useState(
    "bread milk eggs\nbread butter\nmilk eggs butter\nbread milk butter\nbread milk eggs butter\nmilk eggs\nbread eggs\nbread milk"
  );
  const [minSupport, setMinSupport] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDatasetText(String(reader.result || ""));
    reader.readAsText(file);
  };

  const runApriori = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: datasetText, minSupport: Number(minSupport) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const maxSupport = result
    ? Math.max(
        1,
        ...result.levels.flatMap((lvl) => lvl.itemsets.map((it) => it.support))
      )
    : 1;

  return (
    <>
      <Head>
        <title>Apriori Algorithm — Data Mining Project</title>
      </Head>
      <div className="container">
        <header className="header">
          <h1>Apriori Algorithm — Frequent Itemset Mining</h1>
        </header>

        <section className="card">
          <h2>1. Input</h2>
          <div className="row">
            <div>
              <label>Upload dataset (.txt)</label>
              <input type="file" accept=".txt,.csv" onChange={handleFile} />
            </div>
            <div>
              <label>Minimum Support (count)</label>
              <input
                type="number"
                min="1"
                value={minSupport}
                onChange={(e) => setMinSupport(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label>Or paste / edit transactions (one per line)</label>
            <textarea
              value={datasetText}
              onChange={(e) => setDatasetText(e.target.value)}
            />
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button className="btn" onClick={runApriori} disabled={loading}>
              {loading ? "Running..." : "Run Apriori"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setResult(null);
                setError("");
              }}
            >
              Clear Results
            </button>
          </div>
          {error && <div className="error">⚠ {error}</div>}
        </section>

        {result && (
          <section className="card">
            <h2>2. Results</h2>
            <div className="summary">
              <div className="chip">
                Transactions: <strong>{result.transactions}</strong>
              </div>
              <div className="chip">
                Min Support: <strong>{result.minSupport}</strong>
              </div>
              <div className="chip">
                Levels found: <strong>{result.levels.length}</strong>
              </div>
            </div>

            {result.levels.map((lvl) => (
              <div key={lvl.k}>
                <div className="level-title">
                  L{lvl.k} — Frequent {lvl.k}-itemsets ({lvl.itemsets.length})
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "55%" }}>Itemset</th>
                      <th style={{ width: "15%" }}>Support</th>
                      <th>Visualization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lvl.itemsets.map((it, i) => (
                      <tr key={i}>
                        <td>
                          {it.items.map((x, j) => (
                            <span key={j} className="itemset-pill">{x}</span>
                          ))}
                        </td>
                        <td>{it.support}</td>
                        <td>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${(it.support / maxSupport) * 100}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        )}

        <footer>
          Apriori Data Mining Project &middot; Academic Year 2025/2026
        </footer>
      </div>
    </>
  );
}
