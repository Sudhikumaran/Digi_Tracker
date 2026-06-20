const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { reportRepository } = require('../repositories/firebaseRepositories');
const analyticsService = require('./analyticsService');
const rewardService = require('./rewardService');
const moduleRepository = require('../repositories/moduleRepository');
const entryRepository = require('../repositories/entryRepository');
const AppError = require('../utils/AppError');

const REPORTS_DIR = path.join(__dirname, '../../reports');

class ReportService {
  async generate(businessId, userId, data) {
    const report = await reportRepository.create({
      businessId,
      generatedBy: userId,
      type: data.type,
      period: data.period,
      format: data.format,
      status: 'pending',
    });

    try {
      const reportData = await this._collectReportData(businessId, data);
      let filePath;

      switch (data.format) {
        case 'pdf':
          filePath = await this._generatePDF(report._id, reportData);
          break;
        case 'excel':
          filePath = await this._generateExcel(report._id, reportData);
          break;
        case 'csv':
          filePath = await this._generateCSV(report._id, reportData);
          break;
        default:
          throw new AppError('Unsupported format', 400);
      }

      await reportRepository.update(report._id, {
        status: 'completed',
        fileUrl: `/reports/${path.basename(filePath)}`,
        metadata: { entryCount: reportData.entries.length },
      });

      return reportRepository.findById(report._id);
    } catch (error) {
      await reportRepository.update(report._id, { status: 'failed' });
      throw error;
    }
  }

  async list(businessId, page = 1, limit = 20) {
    return reportRepository.findByBusiness(businessId, page, limit);
  }

  async getDownloadPath(businessId, reportId) {
    const report = await reportRepository.findById(reportId);
    if (!report || String(report.businessId) !== String(businessId)) {
      throw new AppError('Report not found', 404);
    }
    if (report.status !== 'completed') {
      throw new AppError('Report not ready', 400);
    }
    const filePath = path.join(REPORTS_DIR, path.basename(report.fileUrl));
    if (!fs.existsSync(filePath)) throw new AppError('Report file not found', 404);
    return { filePath, format: report.format };
  }

  async _collectReportData(businessId, data) {
    const [dashboard, insights, leaderboard, modules] = await Promise.all([
      analyticsService.getDashboard(businessId),
      analyticsService.getInsights(businessId),
      data.includeLeaderboard ? rewardService.getLeaderboard(businessId, 'monthly') : null,
      moduleRepository.findByBusiness(businessId, { isActive: true }),
    ]);

    const entries = await entryRepository.findByBusiness(
      businessId,
      {
        entryDate: {
          $gte: new Date(data.period.start),
          $lte: new Date(data.period.end),
        },
      },
      1,
      10000
    );

    return { dashboard, insights, leaderboard, modules, entries: entries.entries, period: data.period };
  }

  async _generatePDF(reportId, data) {
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const filePath = path.join(REPORTS_DIR, `report-${reportId}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(24).text('DigiTracker Growth Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(16).text('Dashboard Summary');
    doc.fontSize(12);
    doc.text(`Total Modules: ${data.dashboard.totalModules}`);
    doc.text(`Total Staff: ${data.dashboard.totalStaff}`);
    doc.text(`Total Entries: ${data.dashboard.totalEntries}`);
    if (data.dashboard.bestPerformingModule) {
      doc.text(`Best Module: ${data.dashboard.bestPerformingModule.name} (+${data.dashboard.bestPerformingModule.growth}%)`);
    }
    doc.moveDown();

    doc.fontSize(16).text('Insights');
    doc.fontSize(12);
    if (data.insights.fastestGrowingChannel) {
      doc.text(`Fastest Growing: ${data.insights.fastestGrowingChannel.module} (+${data.insights.fastestGrowingChannel.growth}%)`);
    }
    doc.text(`Consistency Score: ${data.insights.consistencyScore}%`);
    doc.moveDown();

    if (data.leaderboard) {
      doc.fontSize(16).text('Leaderboard');
      doc.fontSize(12);
      data.leaderboard.leaderboard.slice(0, 10).forEach((item) => {
        doc.text(`${item.rank}. ${item.name} - ${item.points} pts (Streak: ${item.streak})`);
      });
    }

    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
    return filePath;
  }

  async _generateExcel(reportId, data) {
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const filePath = path.join(REPORTS_DIR, `report-${reportId}.xlsx`);
    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Metric', 'Value']);
    summarySheet.addRow(['Total Modules', data.dashboard.totalModules]);
    summarySheet.addRow(['Total Staff', data.dashboard.totalStaff]);
    summarySheet.addRow(['Total Entries', data.dashboard.totalEntries]);
    summarySheet.addRow(['Consistency Score', `${data.insights.consistencyScore}%`]);

    const entriesSheet = workbook.addWorksheet('Entries');
    entriesSheet.addRow(['Date', 'Module', 'Submitted By', 'Values']);
    for (const entry of data.entries) {
      entriesSheet.addRow([
        entry.entryDate.toISOString().split('T')[0],
        entry.moduleId?.name || 'N/A',
        entry.userId ? `${entry.userId.firstName} ${entry.userId.lastName}` : 'N/A',
        entry.values.map((v) => `${v.fieldSlug}: ${v.value}`).join(', '),
      ]);
    }

    if (data.leaderboard) {
      const lbSheet = workbook.addWorksheet('Leaderboard');
      lbSheet.addRow(['Rank', 'Name', 'Points', 'Streak']);
      data.leaderboard.leaderboard.forEach((item) => {
        lbSheet.addRow([item.rank, item.name, item.points, item.streak]);
      });
    }

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  async _generateCSV(reportId, data) {
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const filePath = path.join(REPORTS_DIR, `report-${reportId}.csv`);
    const rows = ['Date,Module,Submitted By,Field,Value'];

    for (const entry of data.entries) {
      for (const val of entry.values) {
        rows.push([
          entry.entryDate.toISOString().split('T')[0],
          entry.moduleId?.name || 'N/A',
          entry.userId ? `${entry.userId.firstName} ${entry.userId.lastName}` : 'N/A',
          val.fieldSlug,
          val.value,
        ].join(','));
      }
    }

    fs.writeFileSync(filePath, rows.join('\n'));
    return filePath;
  }
}

module.exports = new ReportService();
