'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import emailjs from '@emailjs/browser';
import { Download, Mail } from '@/components/icons/Icons';
import { FundAllocation, GrowthData, Scenarios, CrisisResult, WhatIfResult } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface ExportButtonsProps {
  mode: 'guided' | 'custom' | 'rebalance';
  investmentAmount: number;
  timeHorizon: number;
  recurringContribution: number;
  contributionFrequency: string;
  scenarios: Scenarios;
  fundAllocations: FundAllocation[];
  weightedExpenseRatio: number;
  totalCost: number;
  totalFeesLost: number;
  totalAdvisorFeesLost: number;
  finalValue: number;
  totalContributed: number;
  totalReturn: number;
  totalDividends: number;
  capitalGains: number;
  growthData: GrowthData;
  crisis2008: CrisisResult;
  crisisDotCom: CrisisResult;
  crisisDepression: CrisisResult;
  whatIfSmallCap: WhatIfResult;
  whatIfBondCrisis: WhatIfResult;
  whatIfIntlCollapse: WhatIfResult;
}

export default function ExportButtons({
  mode,
  investmentAmount,
  timeHorizon,
  recurringContribution,
  contributionFrequency,
  scenarios,
  fundAllocations,
  weightedExpenseRatio,
  totalCost,
  totalFeesLost,
  totalAdvisorFeesLost,
  finalValue,
  totalContributed,
  totalReturn,
  totalDividends,
  capitalGains,
  growthData,
  crisis2008,
  crisisDotCom,
  crisisDepression,
  whatIfSmallCap,
  whatIfBondCrisis,
  whatIfIntlCollapse
}: ExportButtonsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      let yPos = 0;

      // Helper function to add colored box
      const addColoredBox = (x: number, y: number, width: number, height: number, fillColor: number[], borderColor: number[]) => {
        pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(x, y, width, height, 2, 2, 'FD');
      };

      // Helper to check if we need a new page
      const checkNewPage = (spaceNeeded: number) => {
        if (yPos + spaceNeeded > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // PAGE 1: Header and Summary
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 50, 'F');

      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Investment Allocation Report', pageWidth / 2, 25, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated: ' + new Date().toLocaleDateString(), pageWidth / 2, 35, { align: 'center' });

      yPos = 60;

      // Portfolio Summary
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PORTFOLIO SUMMARY', margin, yPos);
      yPos += 8;

      addColoredBox(margin, yPos, pageWidth - 2 * margin, 32, [239, 246, 255], [191, 219, 254]);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 30, 30);
      yPos += 8;
      pdf.text('Mode: ' + (mode === 'guided' ? 'Guided Portfolio' : mode === 'custom' ? 'Custom Mix' : 'Rebalance'), margin + 5, yPos);
      yPos += 6;
      pdf.text('Initial Investment: $' + investmentAmount.toLocaleString('en-US'), margin + 5, yPos);
      yPos += 6;
      if (recurringContribution > 0) {
        pdf.text('Recurring: $' + recurringContribution.toLocaleString('en-US') + ' (' + contributionFrequency + ')', margin + 5, yPos);
        yPos += 6;
      }
      pdf.text('Time Horizon: ' + timeHorizon + ' years | Expected Return: ' + scenarios.expected.toFixed(1) + '% (Range: ' + scenarios.conservative.toFixed(1) + '%-' + scenarios.optimistic.toFixed(1) + '%)', margin + 5, yPos);
      yPos += 12;

      // Fund Allocations
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('FUND ALLOCATIONS', margin, yPos);
      yPos += 8;

      const colors = [
        { fill: [239, 246, 255], border: [191, 219, 254], text: [59, 130, 246] },
        { fill: [243, 244, 246], border: [209, 213, 219], text: [99, 102, 241] },
        { fill: [236, 253, 245], border: [167, 243, 208], text: [16, 185, 129] },
        { fill: [240, 253, 244], border: [167, 243, 208], text: [5, 150, 105] },
        { fill: [254, 252, 232], border: [253, 224, 71], text: [245, 158, 11] },
        { fill: [254, 242, 242], border: [254, 202, 202], text: [239, 68, 68] }
      ];

      fundAllocations.forEach((fund, index) => {
        checkNewPage(35);

        const color = colors[index % colors.length];
        addColoredBox(margin, yPos, pageWidth - 2 * margin, 28, color.fill, color.border);

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(color.text[0], color.text[1], color.text[2]);
        pdf.text(fund.ticker, margin + 5, yPos + 7);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(9);
        pdf.text(fund.fullName, margin + 25, yPos + 7);

        // Provider
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(pageWidth - margin - 25, yPos + 4, 20, 5, 1, 1, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(80, 80, 80);
        pdf.text(fund.provider, pageWidth - margin - 15, yPos + 7, { align: 'center' });

        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('$' + fund.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), margin + 5, yPos + 15);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text('(' + fund.percentage.toFixed(1) + '%)', margin + 50, yPos + 15);

        pdf.setFontSize(8);
        pdf.setTextColor(80, 80, 80);
        pdf.text('Fee: ' + fund.expenseRatio + '% | Yield: ' + fund.dividendYield + '% | Tax: ' + fund.taxEfficiency, margin + 5, yPos + 22);

        yPos += 33;
      });

      // Cost Analysis
      checkNewPage(70);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('COST ANALYSIS', margin, yPos);
      yPos += 8;

      const boxWidth = (pageWidth - 2 * margin - 10) / 3;

      addColoredBox(margin, yPos, boxWidth, 22, [239, 246, 255], [147, 197, 253]);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Weighted Expense Ratio', margin + boxWidth / 2, yPos + 7, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text(weightedExpenseRatio.toFixed(3) + '%', margin + boxWidth / 2, yPos + 16, { align: 'center' });

      addColoredBox(margin + boxWidth + 5, yPos, boxWidth, 22, [254, 249, 195], [253, 224, 71]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Annual Cost', margin + boxWidth + 5 + boxWidth / 2, yPos + 7, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(245, 158, 11);
      pdf.text('$' + totalCost.toLocaleString('en-US', { minimumFractionDigits: 0 }), margin + boxWidth + 5 + boxWidth / 2, yPos + 16, { align: 'center' });

      addColoredBox(margin + 2 * boxWidth + 10, yPos, boxWidth, 22, [254, 242, 242], [252, 165, 165]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Fees Lost (' + timeHorizon + 'Y)', margin + 2 * boxWidth + 10 + boxWidth / 2, yPos + 7, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(239, 68, 68);
      pdf.text('$' + totalFeesLost.toLocaleString('en-US', { minimumFractionDigits: 0 }), margin + 2 * boxWidth + 10 + boxWidth / 2, yPos + 16, { align: 'center' });

      yPos += 28;

      // Financial Advisor Comparison
      addColoredBox(margin, yPos, pageWidth - 2 * margin, 28, [254, 242, 242], [252, 165, 165]);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(153, 27, 27);
      pdf.text('Cost of 1% Financial Advisor Fee', margin + 5, yPos + 7);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38);
      pdf.text('$' + totalAdvisorFeesLost.toLocaleString('en-US', { minimumFractionDigits: 0 }), margin + 5, yPos + 18);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(127, 29, 29);
      pdf.text('Additional cost vs. self-managing these ETFs', margin + 5, yPos + 23);

      // Save PDF
      pdf.save('investment-allocation-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }

    setIsGeneratingPDF(false);
  };

  const sendEmail = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSendingEmail(true);

    try {
      const summaryText = `
Investment Allocation Summary
============================
Mode: ${mode === 'guided' ? 'Guided Portfolio' : mode === 'custom' ? 'Custom Mix' : 'Rebalance'}
Initial Investment: $${investmentAmount.toLocaleString()}
Time Horizon: ${timeHorizon} years
${recurringContribution > 0 ? `Recurring Contribution: $${recurringContribution.toLocaleString()} (${contributionFrequency})` : ''}

Portfolio Allocation:
${fundAllocations.map(f => `- ${f.ticker}: $${f.amount.toLocaleString()} (${f.percentage.toFixed(1)}%)`).join('\n')}

Projected Value (${timeHorizon} years): $${finalValue.toLocaleString()}
Total Return: $${totalReturn.toLocaleString()} (${((totalReturn / totalContributed) * 100).toFixed(1)}%)
Weighted Expense Ratio: ${weightedExpenseRatio.toFixed(3)}%
      `.trim();

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_USER!,
        {
          to_email: userEmail,
          subject: 'Your Investment Allocation Report',
          message: summaryText
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      alert('Email sent successfully!');
      setShowEmailInput(false);
      setUserEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    }

    setIsSendingEmail(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Export & Share</h3>

      <div className="space-y-4">
        {/* Download PDF Button */}
        <button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className="w-full py-3.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-5 h-5" />
          {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
        </button>

        {/* Email Section */}
        {!showEmailInput ? (
          <button
            onClick={() => setShowEmailInput(true)}
            className="w-full py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Email Report
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={sendEmail}
                disabled={isSendingEmail}
                className="flex-1 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Mail className="w-4 h-4" />
                {isSendingEmail ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={() => {
                  setShowEmailInput(false);
                  setUserEmail('');
                }}
                className="py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
