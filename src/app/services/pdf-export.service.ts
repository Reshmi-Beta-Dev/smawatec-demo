import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }

  async generateAnalyticsPDF(data: {
    title: string;
    period: { from: string; to: string };
    selection: { type: string; name: string; details?: any };
    consumptionData: any[];
    chartData: any;
    exportData: any;
    buildingGroups: any[];
    buildings: any[];
    apartments: any[];
  }): Promise<void> {
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Set up fonts and colors
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(44, 62, 80); // Dark blue-gray

    // Header
    pdf.text('Water Consumption Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Subtitle
    pdf.setFontSize(12);
    pdf.setTextColor(52, 73, 94);
    pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Selection Information (enhanced with address and tenant)
    yPosition = this.addSelectionInfo(pdf, data.selection, data.period, yPosition, data.exportData);

    // Export Statistics (includes water cost)
    yPosition = this.addExportStatistics(pdf, data.exportData, yPosition);

    // Chart Section (compact for single-page)
    if (data.chartData && yPosition < pageHeight - 80) {
      yPosition = await this.addChartSection(pdf, data.chartData, yPosition, /*compact=*/true);
    }

    // Footer
    this.addFooter(pdf, pageWidth, pageHeight);

    // Save the PDF
    pdf.save(`water-consumption-analytics-${this.formatDateForFilename(data.period.from)}-to-${this.formatDateForFilename(data.period.to)}.pdf`);
  }

  private addSelectionInfo(pdf: jsPDF, selection: any, period: any, yPosition: number, exportData?: any): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(44, 62, 80);

    // Gather lines
    const lines: string[] = [];
    lines.push(`Selection: ${selection.type} - ${selection.name}`);
    lines.push(`Period: ${this.formatDate(period.from)} to ${this.formatDate(period.to)}`);

    const d = selection.details || {};
    const addressParts: string[] = [];
    if (d.street) addressParts.push(d.street);
    if (d.city) addressParts.push(d.city);
    if (d.zipCode || d.zip_code) addressParts.push(d.zipCode || d.zip_code);
    if (addressParts.length) lines.push(`Address: ${addressParts.join(', ')}`);
    if (d.tenant) lines.push(`Tenant: ${d.tenant}`);

    if (exportData && exportData.waterCostLastMonth) {
      lines.push(`Water Cost (Last Month): ${exportData.waterCostLastMonth}`);
    }

    // Compute box height based on lines
    const lineHeight = 4;
    const headerHeight = 8;
    const boxHeight = headerHeight + 4 + lines.length * lineHeight + 4;

    // Draw box
    pdf.setDrawColor(52, 73, 94);
    pdf.setFillColor(236, 240, 241);
    pdf.roundedRect(20, yPosition, pageWidth - 40, boxHeight, 3, 3, 'FD');

    // Title
    pdf.text('Analysis Scope', 25, yPosition + 7);

    // Details
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(52, 73, 94);

    let lineY = yPosition + headerHeight + 6;
    const labelWidth = 48; // align values after labels consistently

    lines.forEach((line) => {
      // Split into label/value for alignment if possible
      const sepIndex = line.indexOf(':');
      if (sepIndex > -1) {
        const label = line.substring(0, sepIndex + 1);
        const value = line.substring(sepIndex + 1).trim();
        pdf.text(label, 25, lineY);
        pdf.text(value, 25 + labelWidth, lineY);
      } else {
        pdf.text(line, 25, lineY);
      }
      lineY += lineHeight;
    });

    return yPosition + boxHeight + 6;
  }

  private addExportStatistics(pdf: jsPDF, exportData: any, yPosition: number): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Statistics list (added water cost last month)
    const stats = [
      { label: 'Today', value: exportData.today },
      { label: 'Yesterday', value: exportData.yesterday },
      { label: 'This Week', value: exportData.thisWeek },
      { label: 'This Month', value: exportData.thisMonth },
      { label: 'This Year', value: exportData.thisYear },
      { label: 'Last Year', value: exportData.lastYear },
      { label: 'Water Cost (Last Month)', value: exportData.waterCostLastMonth }
    ];

    const cols = 3;
    const colWidth = (pageWidth - 60) / cols;
    const rowHeight = 5;
    const rows = Math.ceil(stats.length / cols);
    const boxHeight = 10 + rows * rowHeight + 6;

    // Statistics box
    pdf.setDrawColor(46, 204, 113);
    pdf.setFillColor(236, 252, 243);
    pdf.roundedRect(20, yPosition, pageWidth - 40, boxHeight, 3, 3, 'FD');
    
    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(39, 174, 96);
    pdf.text('Consumption Statistics', 25, yPosition + 7);

    // Grid
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(52, 73, 94);

    stats.forEach((stat, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 25 + (col * colWidth);
      const y = yPosition + 12 + (row * rowHeight);
      
      const label = `${stat.label}:`;
      const value = String(stat.value || '-');

      // draw label
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(52, 73, 94);
      pdf.text(label, x, y);

      // compute dynamic label width and place value safely after it
      const labelPixelWidth = pdf.getTextWidth(label);
      // convert an approximate padding in mm based on font size: add ~2mm gap
      const gap = 2;
      const valueX = x + Math.min(labelPixelWidth + gap, colWidth - 10);

      // ensure value stays inside the column
      const valueMaxWidth = Math.max(10, colWidth - (valueX - x) - 2);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 62, 80);
      const trimmed = value.length > 24 ? value.substring(0, 24) + '…' : value;
      pdf.text(trimmed, valueX, y, { maxWidth: valueMaxWidth });
    });

    return yPosition + boxHeight + 6;
  }

  private async addChartSection(pdf: jsPDF, chartData: any, yPosition: number, compact: boolean = false): Promise<number> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Chart title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(44, 62, 80);
    pdf.text('Consumption Trend Analysis', 20, yPosition);
    yPosition += 8;

    try {
      // Create a temporary canvas for the chart
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = compact ? 220 : 300;
      const ctx = canvas.getContext('2d');
      
      if (ctx && chartData) {
        // Draw a simple bar chart representation (improved x-axis)
        this.drawSimpleChart(ctx, chartData, canvas.width, canvas.height);
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');
        
        // Add chart to PDF
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 6;
      }
    } catch (error) {
      console.error('Error generating chart for PDF:', error);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.setTextColor(231, 76, 60);
      pdf.text('Chart data unavailable for PDF export', 20, yPosition);
      yPosition += 10;
    }

    return yPosition;
  }

  private drawSimpleChart(ctx: CanvasRenderingContext2D, chartData: any, width: number, height: number): void {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Chart area
    const marginLeft = 40;
    const marginRight = 20;
    const marginTop = 30;
    const marginBottom = 50; // give more space for x-axis labels
    const chartWidth = width - (marginLeft + marginRight);
    const chartHeight = height - (marginTop + marginBottom);
    const chartX = marginLeft;
    const chartY = marginTop;
    
    // Draw chart background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    
    // Draw border
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
    
    if (chartData && chartData.labels && chartData.datasets) {
      const labels: string[] = chartData.labels as string[];
      const data: number[] = (chartData.datasets[0]?.data || []) as number[];
      
      if (data.length > 0) {
        const maxValue = Math.max(...data);
        const stepX = chartWidth / data.length;
        const barWidth = stepX * 0.7;
        
        // Bars
        ctx.fillStyle = '#3498db';
        data.forEach((value, index) => {
          const barHeight = (value / maxValue) * chartHeight * 0.9;
          const barX = chartX + (index * stepX) + (stepX - barWidth) / 2;
          const barY = chartY + chartHeight - barHeight;
          ctx.fillRect(barX, barY, barWidth, barHeight);
        });
        
        // X-axis labels: show at most 10 evenly spaced labels
        const maxLabels = 10;
        const labelStep = Math.max(1, Math.floor(labels.length / maxLabels));
        ctx.fillStyle = '#2c3e50';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
          if (index % labelStep === 0 || index === labels.length - 1) {
            const labelX = chartX + (index * stepX) + stepX / 2;
            const labelY = chartY + chartHeight + 18;
            const text = String(label);
            // Truncate long labels to 12 chars
            const truncated = text.length > 12 ? text.substring(0, 12) + '…' : text;
            ctx.fillText(truncated, labelX, labelY);
          }
        });
        
        // Axis titles
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time', chartX + chartWidth / 2, height - 12);
        ctx.save();
        ctx.translate(14, chartY + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Consumption (m³)', 0, 0);
        ctx.restore();
      }
    }
    
    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Water Consumption Trend', width / 2, 20);
  }

  // Removed data tables to keep PDF single-page and focused
  // private addDataTables(...) {} // no longer used

  private formatTableValue(value: any, key: string): string {
    if (value === null || value === undefined) return '-';
    
    if (key === 'tenant' && typeof value === 'string' && value.length > 25) {
      return value.substring(0, 22) + '...';
    }
    
    return String(value).substring(0, 20);
  }

  private addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    const footerY = pageHeight - 15;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(108, 117, 125);
    
    // Left: Company info
    pdf.text('SMAWATEC - Water Management Analytics', 20, footerY);
    
    // Right: Page info
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, footerY, { align: 'right' });
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private formatDateForFilename(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
}
