import { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  const [datasetText, setDatasetText] = useState(
    "bread milk eggs\nbread butter\nmilk eggs butter\nbread milk butter\nbread milk eggs butter\nmilk eggs\nbread eggs\nbread milk"
  );
  const [minSupport, setMinSupport] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Apriori Algorithm &mdash; Intelligence Artificielle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <header className="header">
          <h1>Apriori Algorithm</h1>
          <p>Discover frequent itemsets and extract association rules seamlessly.</p>
        </header>

        <section className="card" style={{ animationDelay: '0.1s' }}>
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Dataset Configuration
          </h2>
          <div className="row">
            <div>
              <label>Upload Dataset (.txt)</label>
              <input type="file" accept=".txt,.csv" onChange={handleFile} />
            </div>
            <div>
              <label>Minimum Support Count</label>
              <input
                type="number"
                min="1"
                value={minSupport}
                onChange={(e) => setMinSupport(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <label>Raw Transaction Data</label>
            <textarea
              value={datasetText}
              onChange={(e) => setDatasetText(e.target.value)}
              placeholder="Enter transactions here, one per line, items separated by spaces..."
            />
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
            <button className="btn" onClick={runApriori} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                  Processing...
                </span>
              ) : (
                "Run Apriori"
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setResult(null);
                setError("");
              }}
            >
              Reset
            </button>
          </div>
          {error && (
            <div className="error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}
        </section>

        {result && (
          <section className="card" style={{ animationDelay: '0.2s' }}>
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
              Analysis Results
            </h2>
            <div className="summary">
              <div className="chip">
                <span>Transactions Analyzed</span>
                <strong>{result.transactions}</strong>
              </div>
              <div className="chip">
                <span>Min Support Configured</span>
                <strong>{result.minSupport}</strong>
              </div>
              <div className="chip">
                <span>Itemset Levels</span>
                <strong>{result.levels.length}</strong>
              </div>
            </div>

            {result.levels.map((lvl) => (
              <div key={lvl.k}>
                <div className="level-title">
                  <span>L{lvl.k} &mdash; Frequent {lvl.k}-itemsets</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
                    {lvl.itemsets.length} pattern{lvl.itemsets.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "50%" }}>Itemset combination</th>
                      <th style={{ width: "15%" }}>Support</th>
                      <th style={{ width: "35%" }}>Relative Frequency</th>
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
                        <td style={{ fontWeight: 600 }}>{it.support}</td>
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
          &copy; {new Date().getFullYear()} Apriori Data Mining Project &middot; Developed for Intelligence Artificielle &amp; BI
        </footer>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    </>
  );
}
