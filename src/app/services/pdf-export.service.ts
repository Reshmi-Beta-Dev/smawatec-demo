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

    // Selection Information
    this.addSelectionInfo(pdf, data.selection, data.period, yPosition);
    yPosition += 25;

    // Export Statistics
    this.addExportStatistics(pdf, data.exportData, yPosition);
    yPosition += 35;

    // Chart Section
    if (data.chartData) {
      yPosition = await this.addChartSection(pdf, data.chartData, yPosition);
    }

    // Data Tables
    yPosition = this.addDataTables(pdf, data, yPosition);

    // Footer
    this.addFooter(pdf, pageWidth, pageHeight);

    // Save the PDF
    pdf.save(`water-consumption-analytics-${this.formatDateForFilename(data.period.from)}-to-${this.formatDateForFilename(data.period.to)}.pdf`);
  }

  private addSelectionInfo(pdf: jsPDF, selection: any, period: any, yPosition: number): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Selection box
    pdf.setDrawColor(52, 73, 94);
    pdf.setFillColor(236, 240, 241);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 20, 3, 3, 'FD');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(44, 62, 80);
    pdf.text('Analysis Scope', 25, yPosition + 8);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(52, 73, 94);
    pdf.text(`Selection: ${selection.type} - ${selection.name}`, 25, yPosition + 14);
    pdf.text(`Period: ${this.formatDate(period.from)} to ${this.formatDate(period.to)}`, 25, yPosition + 18);
  }

  private addExportStatistics(pdf: jsPDF, exportData: any, yPosition: number): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Statistics box
    pdf.setDrawColor(46, 204, 113);
    pdf.setFillColor(236, 252, 243);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'FD');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(39, 174, 96);
    pdf.text('Consumption Statistics', 25, yPosition + 8);
    
    // Statistics grid
    const stats = [
      { label: 'Today', value: exportData.today },
      { label: 'Yesterday', value: exportData.yesterday },
      { label: 'This Week', value: exportData.thisWeek },
      { label: 'This Month', value: exportData.thisMonth },
      { label: 'This Year', value: exportData.thisYear },
      { label: 'Last Year', value: exportData.lastYear }
    ];

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(52, 73, 94);

    const colWidth = (pageWidth - 60) / 3;
    const rowHeight = 4;

    stats.forEach((stat, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 25 + (col * colWidth);
      const y = yPosition + 12 + (row * rowHeight);
      
      pdf.text(`${stat.label}:`, x, y);
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.value, x + 25, y);
      pdf.setFont('helvetica', 'normal');
    });
  }

  private async addChartSection(pdf: jsPDF, chartData: any, yPosition: number): Promise<number> {
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
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      if (ctx && chartData) {
        // Draw a simple bar chart representation
        this.drawSimpleChart(ctx, chartData, canvas.width, canvas.height);
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');
        
        // Add chart to PDF
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
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
    const margin = 40;
    const chartWidth = width - (margin * 2);
    const chartHeight = height - (margin * 2);
    const chartX = margin;
    const chartY = margin;
    
    // Draw chart background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    
    // Draw border
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);
    
    if (chartData && chartData.labels && chartData.datasets) {
      const labels = chartData.labels;
      const data = chartData.datasets[0]?.data || [];
      
      if (data.length > 0) {
        const barWidth = chartWidth / labels.length * 0.8;
        const maxValue = Math.max(...data);
        
        // Draw bars
        ctx.fillStyle = '#3498db';
        labels.forEach((label: string, index: number) => {
          const barHeight = (data[index] / maxValue) * chartHeight * 0.8;
          const barX = chartX + (index * chartWidth / labels.length) + (chartWidth / labels.length - barWidth) / 2;
          const barY = chartY + chartHeight - barHeight;
          
          ctx.fillRect(barX, barY, barWidth, barHeight);
        });
        
        // Draw labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        labels.forEach((label: string, index: number) => {
          const labelX = chartX + (index * chartWidth / labels.length) + chartWidth / labels.length / 2;
          const labelY = chartY + chartHeight + 15;
          ctx.fillText(label.substring(0, 8), labelX, labelY);
        });
      }
    }
    
    // Draw title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Water Consumption Trend', width / 2, 25);
  }

  private addDataTables(pdf: jsPDF, data: any, yPosition: number): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Building Groups Table
    if (data.buildingGroups && data.buildingGroups.length > 0) {
      yPosition = this.addTable(pdf, 'Building Groups Overview', data.buildingGroups, [
        { key: 'name', label: 'Group Name', width: 60 },
        { key: 'buildingCount', label: 'Buildings', width: 20 },
        { key: 'apartmentCount', label: 'Apartments', width: 25 },
        { key: 'deviceCount', label: 'Devices', width: 20 }
      ], yPosition, pageWidth, pageHeight);
    }
    
    // Buildings Table
    if (data.buildings && data.buildings.length > 0) {
      yPosition = this.addTable(pdf, 'Buildings Overview', data.buildings, [
        { key: 'name', label: 'Building Name', width: 50 },
        { key: 'apartmentCount', label: 'Apartments', width: 25 },
        { key: 'deviceCount', label: 'Devices', width: 25 },
        { key: 'city', label: 'City', width: 30 }
      ], yPosition, pageWidth, pageHeight);
    }
    
    // Apartments Table
    if (data.apartments && data.apartments.length > 0) {
      yPosition = this.addTable(pdf, 'Apartments Overview', data.apartments, [
        { key: 'apartment', label: 'Apartment', width: 30 },
        { key: 'tenant', label: 'Tenant', width: 50 },
        { key: 'type', label: 'Type', width: 40 },
        { key: 'building', label: 'Building', width: 30 }
      ], yPosition, pageWidth, pageHeight);
    }
    
    return yPosition;
  }

  private addTable(pdf: jsPDF, title: string, data: any[], columns: any[], yPosition: number, pageWidth: number, pageHeight: number): number {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }
    
    // Table title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(44, 62, 80);
    pdf.text(title, 20, yPosition);
    yPosition += 8;
    
    // Table header
    pdf.setFillColor(52, 73, 94);
    pdf.setDrawColor(52, 73, 94);
    pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    
    let xPosition = 22;
    columns.forEach(column => {
      pdf.text(column.label, xPosition, yPosition + 5);
      xPosition += column.width;
    });
    
    yPosition += 8;
    
    // Table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(52, 73, 94);
    
    const maxRows = Math.min(data.length, 15); // Limit rows to fit on page
    
    for (let i = 0; i < maxRows; i++) {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const row = data[i];
      const rowY = yPosition + (i * 5);
      
      // Alternate row colors
      if (i % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, rowY - 2, pageWidth - 40, 5, 'F');
      }
      
      xPosition = 22;
      columns.forEach(column => {
        const value = this.formatTableValue(row[column.key], column.key);
        pdf.text(value, xPosition, rowY);
        xPosition += column.width;
      });
    }
    
    yPosition += (maxRows * 5) + 10;
    
    if (data.length > maxRows) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(108, 117, 125);
      pdf.text(`... and ${data.length - maxRows} more items`, 20, yPosition);
      yPosition += 5;
    }
    
    return yPosition;
  }

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
