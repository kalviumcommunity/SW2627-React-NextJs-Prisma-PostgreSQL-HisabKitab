"use client";

import { useState } from 'react';
import styles from './PaperImportView.module.css';

export default function PaperImportView() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('UPLOAD'); // UPLOAD, REVIEW, SUCCESS
  const [extractedData, setExtractedData] = useState(null);
  const [batchInfo, setBatchInfo] = useState(null);
  
  // Temporary: we need a shopId to upload. In a real app this comes from context
  const [shopId, setShopId] = useState('placeholder_shop_id'); 

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !shopId) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('shopId', shopId);

    try {
      const res = await fetch('/api/paper-import/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setExtractedData(data.extractedData || { contactName: '', finalBalance: 0, transactions: [] });
      setBatchInfo({ batchId: data.batchId, pageId: data.pageId });
      setStep('REVIEW');
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionChange = (index, field, value) => {
    const newTxs = [...(extractedData.transactions || [])];
    newTxs[index] = { ...newTxs[index], [field]: value };
    setExtractedData({ ...extractedData, transactions: newTxs });
  };

  const handleCommit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paper-import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          batchId: batchInfo?.batchId,
          pageId: batchInfo?.pageId,
          reviewedData: extractedData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Commit failed');

      setStep('SUCCESS');
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Date", "Type", "Amount", "Note"];
    const rows = (extractedData.transactions || []).map(t => 
      [t.date || '', t.type || '', t.amount || 0, t.note || ''].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `khata_export_${extractedData.contactName || 'contact'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AI Paper Khata Import</h1>
        <p>Digitize your old handwritten ledgers by uploading a photo.</p>
      </div>

      {step === 'UPLOAD' && (
        <div className={styles.uploadCard}>
          <div className={styles.inputGroup}>
            <label>Shop ID (For testing)</label>
            <input 
              type="text" 
              value={shopId} 
              onChange={e => setShopId(e.target.value)} 
              placeholder="Enter Shop ID"
            />
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className={styles.fileInput}
          />
          
          <button 
            onClick={handleUpload} 
            disabled={!file || loading} 
            className={styles.btnPrimary}
          >
            {loading ? 'Uploading & Extracting (AI)...' : 'Upload & Extract'}
          </button>
        </div>
      )}

      {step === 'REVIEW' && extractedData && (
        <div className={styles.reviewSection}>
          <h2>Review Extracted Data</h2>
          <p style={{marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem'}}>
            Please review the data extracted by AI. Make any necessary corrections before saving.
          </p>

          <div className={styles.inputGroup}>
            <label>Contact Name</label>
            <input 
              type="text" 
              value={extractedData.contactName || ''} 
              onChange={e => setExtractedData({...extractedData, contactName: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Opening Balance (if explicitly written on page)</label>
            <input 
              type="number" 
              value={extractedData.finalBalance || 0} 
              onChange={e => setExtractedData({...extractedData, finalBalance: e.target.value})}
            />
          </div>

          <h3 style={{fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem'}}>Transactions</h3>
          
          <div style={{overflowX: 'auto'}}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {(extractedData.transactions || []).map((t, i) => (
                  <tr key={i}>
                    <td>
                      <input 
                        type="text" 
                        value={t.date || ''} 
                        onChange={(e) => handleTransactionChange(i, 'date', e.target.value)}
                        placeholder="YYYY-MM-DD"
                      />
                    </td>
                    <td>
                      <select 
                        value={t.type || 'YOU_GAVE'} 
                        onChange={(e) => handleTransactionChange(i, 'type', e.target.value)}
                      >
                        <option value="YOU_GAVE">You Gave (Debit)</option>
                        <option value="YOU_GOT">You Got (Credit)</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={t.amount || 0} 
                        onChange={(e) => handleTransactionChange(i, 'amount', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={t.note || ''} 
                        onChange={(e) => handleTransactionChange(i, 'note', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
                {(!extractedData.transactions || extractedData.transactions.length === 0) && (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', color: '#9ca3af', padding: '1rem'}}>
                      No transactions extracted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.actions}>
            <button onClick={exportCSV} className={styles.btnSecondary} type="button">
              Download CSV (Excel)
            </button>
            <button 
              onClick={handleCommit} 
              disabled={loading} 
              className={styles.btnPrimary}
            >
              {loading ? 'Committing...' : 'Confirm & Commit to Database'}
            </button>
          </div>
        </div>
      )}

      {step === 'SUCCESS' && (
        <div className={styles.uploadCard}>
          <h2 style={{color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold'}}>Success!</h2>
          <p style={{marginTop: '1rem'}}>The ledger has been successfully digitized and transactions are added to the database.</p>
          <button onClick={() => { setStep('UPLOAD'); setFile(null); }} className={styles.btnPrimary} style={{marginTop: '1.5rem'}}>
            Import Another Page
          </button>
        </div>
      )}
    </div>
  );
}
