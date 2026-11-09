import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Download,
  FileText,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  User,
  MapPin,
  Code2
} from 'lucide-react';

export const CareerReport = () => {
  const { profile, recommendation, resumeAnalysis, analytics, showToast, setActiveSection } = useApp();
  const [generating, setGenerating] = useState(false);

  if (!recommendation) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Download size={40} color="#6366f1" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
          No Career Report Available Yet
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
          Please complete your profile and generate a career recommendation before generating your comprehensive academic project PDF report.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveSection('guidance')}>
          Go to Career Guidance <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    try {
      setGenerating(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [99, 102, 241]; // #6366f1
      const darkColor = [17, 24, 39]; // #111827
      const grayColor = [100, 116, 139];

      // Page Header
      doc.setFillColor(...darkColor);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('AI CAREER GUIDANCE & READINESS REPORT', 14, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text('Generative AI, RAG Knowledge Retrieval & MCP Framework', 14, 26);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Student: ${profile?.name || 'Alex Johnson'}`, 14, 31);

      let currentY = 44;

      // Section 1: Executive Summary & Recommendation
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text('1. EXECUTIVE RECOMMENDATION & COMPATIBILITY', 14, currentY);
      currentY += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);

      const summaryText = [
        `Recommended Career Track: ${recommendation.bestFitCareer} (Career Match Score: ${recommendation.matchScore}%)`,
        `Student Academic Background: ${profile?.education || 'Computer Science / Engineering'}`,
        `Current Programming Knowledge: ${profile?.programmingKnowledge || 'Object-oriented programming and web fundamentals'}`,
        `Target Roles: ${recommendation.relevantJobRoles?.slice(0, 3).join(', ') || 'Software Engineer'}`
      ];

      summaryText.forEach(line => {
        doc.text(line, 14, currentY);
        currentY += 5;
      });

      currentY += 2;
      doc.setFontSize(9);
      doc.setTextColor(...grayColor);
      const splitExplanation = doc.splitTextToSize(`Recommendation Rationale: ${recommendation.recommendationExplanation}`, 182);
      doc.text(splitExplanation, 14, currentY);
      currentY += splitExplanation.length * 4.5 + 6;

      // Section 2: Skill Gap Analysis Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text('2. AI SKILL-GAP MATRIX', 14, currentY);
      currentY += 4;

      const gapTableData = [
        ...(recommendation.skillGap?.existingSkills || []).map(s => [
          s.skill,
          'Existing Skill',
          `${s.currentProficiency}%`,
          `${s.requiredProficiency}%`,
          'Verified Proficient'
        ]),
        ...(recommendation.skillGap?.missingSkills || []).map(m => [
          m.skill,
          'Missing Skill',
          '30%',
          `${m.requiredProficiency}%`,
          `Priority: ${m.priority} (${m.suggestedImprovement?.slice(0, 40)}...)`
        ])
      ];

      autoTable(doc, {
        startY: currentY,
        head: [['Skill Name', 'Status', 'Current Level', 'Required Level', 'Improvement Action']],
        body: gapTableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8.5, cellPadding: 3 },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // Section 3: Personalized Learning Roadmap
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text('3. PERSONALIZED LEARNING ROADMAP', 14, currentY);
      currentY += 4;

      const roadmapTableData = (recommendation.roadmap || []).map(r => [
        `Stage ${r.stageNumber}: ${r.stageTitle}`,
        r.level,
        r.estimatedDuration,
        (r.topics || []).slice(0, 3).join(', '),
        (r.milestones || []).join(', ')
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Roadmap Stage', 'Level', 'Timeline', 'Key Topics', 'Certification Milestones']],
        body: roadmapTableData,
        theme: 'grid',
        headStyles: { fillColor: darkColor, textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // Section 4: Recommended Practical Projects
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text('4. RECOMMENDED CAPSTONE PROJECTS', 14, currentY);
      currentY += 4;

      const projectTableData = (recommendation.recommendedProjects || []).map(p => [
        p.title,
        p.difficulty,
        (p.requiredTechnologies || []).join(', '),
        p.description?.slice(0, 75) + '...'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Project Title', 'Difficulty', 'Technologies', 'Objectives']],
        body: projectTableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // Section 5: Resume & Interview Performance (if available)
      if (resumeAnalysis || analytics) {
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...primaryColor);
        doc.text('5. ATS RESUME AUDIT & READINESS ASSESSMENT', 14, currentY);
        currentY += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...darkColor);

        if (resumeAnalysis) {
          doc.text(`Resume File: ${resumeAnalysis.fileName} (ATS Score: ${resumeAnalysis.resumeScore}/100)`, 14, currentY);
          currentY += 5;
          doc.text(`Target Role Alignment: ${resumeAnalysis.careerAlignment?.alignmentScore || 75}% (${resumeAnalysis.careerAlignment?.careerReadiness || 'Evaluated'})`, 14, currentY);
          currentY += 5;
        }

        if (recommendation.personalizedAdvice) {
          currentY += 2;
          doc.setFont('helvetica', 'bold');
          doc.text('Personalized Career Advice:', 14, currentY);
          currentY += 4;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...grayColor);
          const splitAdvice = doc.splitTextToSize(recommendation.personalizedAdvice, 182);
          doc.text(splitAdvice, 14, currentY);
        }
      }

      // Footer Page Numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${totalPages} • AI Career Guidance Platform Report`,
          105,
          290,
          { align: 'center' }
        );
      }

      const fileName = `Career_Report_${(profile?.name || 'Student').replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      showToast(`Career Report "${fileName}" generated and downloaded successfully!`, 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Failed to generate PDF career report.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Info & Action Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14), rgba(16, 185, 129, 0.1))',
          borderColor: 'rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag-chip tag-chip-primary">
                <Download size={14} /> Section 3.18 Downloadable Career Report
              </span>
              <span className="tag-chip tag-chip-success">
                <Sparkles size={14} /> jsPDF + AutoTable Engine
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Official Academic Career Guidance Report
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '620px', marginTop: '4px' }}>
              Generate a multi-page, publication-ready PDF portfolio report summarizing student profile, Gemini AI recommendations, skill gap matrices, learning roadmaps, and capstone projects.
            </p>
          </div>

          <button
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            onClick={handleDownloadPDF}
            disabled={generating}
          >
            <Download size={18} /> {generating ? 'Compiling PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      {/* Interactive On-Screen Report Preview */}
      <div className="card" style={{ border: '1px solid var(--border-color)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <FileText size={18} color="#6366f1" /> Report Document Preview
            </h3>
            <p className="card-subtitle">
              Live preview of contents that will be exported to the official PDF.
            </p>
          </div>
        </div>

        <div style={{ padding: '24px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Preview */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#818cf8', fontWeight: 700 }}>
              Antigravity AI Career Guidance System
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
              Comprehensive Career Development Portfolio
            </h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', flexWrap: 'wrap' }}>
              <span>Candidate: <strong>{profile?.name || 'Student Candidate'}</strong></span>
              <span>Degree: <strong>{profile?.education || 'Computer Science / Engineering'}</strong></span>
              <span>Date: <strong>{new Date().toLocaleDateString()}</strong></span>
            </div>
          </div>

          {/* Core Recommendation Preview */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
              1. Recommended Career Track: {recommendation.bestFitCareer} ({recommendation.matchScore}% Match)
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {recommendation.recommendationExplanation}
            </p>
          </div>

          {/* Skill Gap Table Preview */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginBottom: '10px' }}>
              2. Skill-Gap & Priority Improvements
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Skill</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Proficiency Target</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Learning Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(recommendation.skillGap?.existingSkills || []).map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{s.skill}</td>
                      <td style={{ padding: '8px', color: '#34d399' }}>Verified Existing</td>
                      <td style={{ padding: '8px' }}>{s.currentProficiency}% / {s.requiredProficiency}%</td>
                      <td style={{ padding: '8px', color: 'var(--text-muted)' }}>Proficiency confirmed</td>
                    </tr>
                  ))}
                  {(recommendation.skillGap?.missingSkills || []).map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{m.skill}</td>
                      <td style={{ padding: '8px', color: '#f87171' }}>Missing / Priority: {m.priority}</td>
                      <td style={{ padding: '8px' }}>Target: {m.requiredProficiency}%</td>
                      <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{m.suggestedImprovement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roadmap Summary Preview */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
              3. Structured Roadmap Stages
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {(recommendation.roadmap || []).map((r, idx) => (
                <div key={idx} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Stage {r.stageNumber}: {r.stageTitle}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {r.level} • {r.estimatedDuration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

