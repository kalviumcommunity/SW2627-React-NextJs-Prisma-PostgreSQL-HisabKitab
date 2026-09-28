"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// Helper Compound Component to demonstrate React Component Composition
function CompositionDemoCard({ children }) {
  return (
    <div style={{ border: "1px solid #4f46e5", borderRadius: "8px", overflow: "hidden", marginTop: "1rem", backgroundColor: "#0f172a" }}>
      {children}
    </div>
  );
}

CompositionDemoCard.Header = function CardHeader({ title }) {
  return <div style={{ background: "#1e1b4b", padding: "0.75rem 1rem", borderBottom: "1px solid #3730a3", color: "#818cf8", fontWeight: "bold" }}>{title}</div>;
};

CompositionDemoCard.Body = function CardBody({ children }) {
  return <div style={{ padding: "1rem", color: "#e2e8f0" }}>{children}</div>;
};

CompositionDemoCard.Footer = function CardFooter({ text }) {
  return <div style={{ background: "#020617", padding: "0.5rem 1rem", fontSize: "0.8rem", color: "#94a3b8", borderTop: "1px solid #1e293b" }}>{text}</div>;
};

export default function VivaPage() {
  const [logs, setLogs] = useState([]);
  const [showCompositionWidget, setShowCompositionWidget] = useState(false);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, msg]);
  };

  // 1. HTTP Status Codes Used Correctly (Backend & System Design - 0.2 pts)
  const demonstrateHttpStatusCodes = () => {
    addLog("--- Demonstrating HTTP Status Codes Used Correctly ---");
    
    const statusCodes = [
      { code: 200, name: "OK", type: "2xx Success", desc: "GET /api/transactions - Request succeeded, balance returned." },
      { code: 201, name: "Created", type: "2xx Success", desc: "POST /api/transactions - New ledger entry created successfully." },
      { code: 400, name: "Bad Request", type: "4xx Client Error", desc: "POST /api/transactions - Invalid body: negative amount." },
      { code: 401, name: "Unauthorized", type: "4xx Client Error", desc: "GET /api/ledger - Missing or expired JWT Auth Token." },
      { code: 404, name: "Not Found", type: "4xx Client Error", desc: "DELETE /api/contacts/999 - Contact ID does not exist." },
      { code: 500, name: "Internal Server Error", type: "5xx Server Error", desc: "POST /api/payment - Database connection failed." }
    ];

    statusCodes.forEach(({ code, name, type, desc }) => {
      addLog(`[HTTP ${code} ${name}] (${type}): ${desc}`);
    });
    addLog("Rule: Use 2xx for success, 4xx for client errors, 5xx for server errors.");
  };

  // 2. Git Workflow (Engineering Practices - 0.3 pts)
  const demonstrateGitWorkflow = () => {
    addLog("--- Demonstrating Professional Git Workflow ---");
    addLog("1. $ git checkout -b feature/ledger-lock (Create & switch to feature branch)");
    addLog("2. $ git status (Verify modified files in working directory)");
    addLog("3. $ git add src/app/ledger/page.jsx (Stage atomic changes)");
    addLog("4. $ git commit -m 'feat(ledger): implement hybrid optimistic locking' (Conventional commit)");
    addLog("5. $ git fetch origin && git rebase origin/main (Keep branch updated with main)");
    addLog("6. $ git push origin feature/ledger-lock (Push feature branch to remote)");
    addLog("7. Create Pull Request (PR) -> Code Review -> Merge into main branch");
  };

  // 3. JavaScript — async/await (Frontend - 0.1 pts)
  const demonstrateAsyncAwait = async () => {
    addLog("--- Demonstrating JavaScript async/await ---");
    addLog("1. Starting async fetch simulation...");

    const fakeFetchTransaction = (id, delay) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (id > 0) resolve({ id, amount: 500, contact: "Aman Sharma" });
          else reject("Invalid Transaction ID");
        }, delay);
      });
    };

    try {
      addLog("2. Awaiting transaction data sequentially...");
      const tx1 = await fakeFetchTransaction(101, 600);
      addLog(`✓ Received Tx #101: ₹${tx1.amount} (${tx1.contact})`);

      addLog("3. Executing parallel async fetches with Promise.all...");
      const [tx2, tx3] = await Promise.all([
        fakeFetchTransaction(102, 400),
        fakeFetchTransaction(103, 400)
      ]);
      addLog(`✓ Parallel fetch complete: Tx #${tx2.id} & Tx #${tx3.id}`);
    } catch (err) {
      addLog(`❌ Caught async error: ${err}`);
    } finally {
      addLog("4. Async flow finished cleanly in finally block.");
    }
  };

  // 4. JavaScript — Event Loop (Frontend - 0.1 pts)
  const demonstrateEventLoop = () => {
    addLog("--- Demonstrating JavaScript Event Loop Execution Order ---");
    addLog("1. [Synchronous] Execution starts on Call Stack.");

    setTimeout(() => {
      addLog("4. [Macrotask Queue / Callback Queue] setTimeout callback runs after Call Stack and Microtasks clear.");
    }, 0);

    Promise.resolve().then(() => {
      addLog("3. [Microtask Queue] Promise .then callback runs immediately after Call Stack empties (higher priority than Macrotasks).");
    });

    addLog("2. [Synchronous] Call stack code completes.");
  };

  // 5. React Component Composition (Frontend - 0.2 pts)
  const demonstrateCompositionPattern = () => {
    addLog("--- Demonstrating React Component Composition ---");
    addLog("Component Composition avoids Prop Drilling by wrapping sub-components using `children` props and Compound Component patterns.");
    addLog("Example: <CompositionDemoCard><CompositionDemoCard.Header /><CompositionDemoCard.Body /></CompositionDemoCard>");
    setShowCompositionWidget(true);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", color: "#0f172a", fontWeight: "bold" }}>Hisab Kitab - Rubric Topics Demo</h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", marginTop: "0.5rem" }}>
          Interactive demonstration of mandatory technical evaluation topics for Hisab Kitab.
        </p>
      </div>

      {/* Action Buttons Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={demonstrateHttpStatusCodes} style={{ ...btnStyle, backgroundColor: "#0284c7" }}>
          1. HTTP Status Codes <br/><span style={subTextStyle}>(0.2 pts • Backend)</span>
        </button>

        <button onClick={demonstrateGitWorkflow} style={{ ...btnStyle, backgroundColor: "#16a34a" }}>
          2. Git Workflow <br/><span style={subTextStyle}>(0.3 pts • Engineering)</span>
        </button>

        <button onClick={demonstrateAsyncAwait} style={{ ...btnStyle, backgroundColor: "#d97706" }}>
          3. JS async/await <br/><span style={subTextStyle}>(0.1 pts • Frontend)</span>
        </button>

        <button onClick={demonstrateEventLoop} style={{ ...btnStyle, backgroundColor: "#9333ea" }}>
          4. JS Event Loop <br/><span style={subTextStyle}>(0.1 pts • Frontend)</span>
        </button>

        <button onClick={demonstrateCompositionPattern} style={{ ...btnStyle, backgroundColor: "#4f46e5" }}>
          5. Component Composition <br/><span style={subTextStyle}>(0.2 pts • Frontend)</span>
        </button>

        <button onClick={() => { setLogs([]); setShowCompositionWidget(false); }} style={{ ...btnStyle, backgroundColor: "#ef4444", gridColumn: "1 / -1" }}>
          Clear Console & Reset
        </button>
      </div>

      {/* Composition Widget Preview */}
      {showCompositionWidget && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#334155", marginBottom: "0.5rem" }}>Live Component Composition Output:</h3>
          <CompositionDemoCard>
            <CompositionDemoCard.Header title="🎯 React Component Composition Demo" />
            <CompositionDemoCard.Body>
              <p style={{ margin: 0 }}>This card is constructed dynamically using compound component pattern!</p>
              <span style={{ fontSize: "0.85rem", color: "#a5f3fc", display: "block", marginTop: "0.5rem" }}>
                Passed as `children` without prop-drilling or monolithic props.
              </span>
            </CompositionDemoCard.Body>
            <CompositionDemoCard.Footer text="React Pattern • Composition over Inheritance" />
          </CompositionDemoCard>
        </div>
      )}

      {/* Log Terminal Display */}
      <div style={{ backgroundColor: "#090d16", color: "#38bdf8", padding: "1.25rem", borderRadius: "12px", minHeight: "360px", fontFamily: "monospace", border: "1px solid #1e293b", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ color: "#f8fafc", fontWeight: "bold", fontSize: "0.9rem" }}>💻 Interactive Terminal Output Log:</span>
          <span style={{ color: "#64748b", fontSize: "0.75rem" }}>{logs.length} entries</span>
        </div>

        {logs.length === 0 ? (
          <span style={{ color: "#475569" }}>Click any topic button above to execute live demonstration...</span>
        ) : (
          logs.map((log, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ marginBottom: "0.4rem", lineHeight: "1.4", wordBreak: "break-word" }}
            >
              <span style={{ color: log.startsWith("---") ? "#facc15" : log.startsWith("❌") ? "#f87171" : log.startsWith("✓") ? "#4ade80" : "#38bdf8" }}>
                {`> ${log}`}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "0.75rem 1rem",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.88rem",
  textAlign: "center",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  transition: "transform 0.1s, opacity 0.2s"
};

const subTextStyle = {
  fontSize: "0.75rem",
  fontWeight: "normal",
  opacity: 0.9,
  display: "inline-block",
  marginTop: "2px"
};

