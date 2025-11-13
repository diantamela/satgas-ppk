// lib/services/reports/report-service.ts
import { db } from "@/db";
import { ReportStatus } from "@prisma/client";

// Report Service
export const reportService = {
  // Create a new report
  async createReport(data: {
    title: string;
    description: string;
    incidentDate?: Date | null;
    incidentLocation?: string | null;
    reporterId: string;
    reporterEmail?: string;
  }) {
    try {
      // Generate report number in format LPN-YYXXXX
      const yy = String(new Date().getFullYear()).slice(-2);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const reportNumber = `LPN-${yy}${randomNum}`;

      const reportData: any = {
        reportNumber,
        title: data.title,
        description: data.description,
        incidentDate: data.incidentDate || null,
        incidentLocation: data.incidentLocation || null,
        status: "PENDING",
        reporterId: data.reporterId,
      };

      // Add reporterEmail if provided (for future schema compatibility)
      if (data.reporterEmail) {
        reportData.reporterEmail = data.reporterEmail;
      }

      const newReport = await db.report.create({
        data: reportData
      });

      return newReport;
    } catch (error) {
      console.error("Error in reportService.createReport:", error);
      throw error;
    }
  },

  // Get report by ID
  async getReportById(id: string) {
    try {
      const report = await db.report.findUnique({
        where: { id },
        include: {
          reporter: {
            select: { name: true, email: true }
          }
        }
      });

      return report;
    } catch (error) {
      console.error("Error in reportService.getReportById:", error);
      throw error;
    }
  },

  // Get report by report number (for public status checking)
  async getReportByNumber(reportNumber: string) {
    try {
      const report = await db.report.findUnique({
        where: { reportNumber }
      });

      return report;
    } catch (error) {
      console.error("Error in reportService.getReportByNumber:", error);
      throw error;
    }
  },

  // Get reports by user ID
  async getReportsByUserId(userId: string) {
    try {
      const reports = await db.report.findMany({
        where: { reporterId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit to recent reports
      });

      return reports;
    } catch (error) {
      console.error("Error in reportService.getReportsByUserId:", error);
      throw error;
    }
  },

  // Get all reports with optional filters
  async getAllReports(filters?: {
    status?: ReportStatus;
    reporterId?: string;
  }) {
    try {
      const whereClause: any = {};

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          whereClause.status = filters.status;
        }
        if (filters.reporterId) {
          whereClause.reporterId = filters.reporterId;
        }
      }

      const reports = await db.report.findMany({
        where: whereClause,
        include: {
          reporter: {
            select: { name: true, email: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reports;
    } catch (error) {
      console.error("Error in reportService.getAllReports:", error);
      throw error;
    }
  },

  // Update report status
  async updateReportStatus(id: string, status: ReportStatus) {
    try {
      const updatedReport = await db.report.update({
        where: { id },
        data: { status }
      });

      return updatedReport;
    } catch (error) {
      console.error("Error in reportService.updateReportStatus:", error);
      throw error;
    }
  },
};