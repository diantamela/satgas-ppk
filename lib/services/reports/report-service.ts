// lib/services/reports/report-service.ts
import { db } from "@/db";
import { ReportStatus, DocumentType } from "@prisma/client";

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

  // Update report (general update method)
  async updateReport(id: string, data: any) {
    try {
      const updatedReport = await db.report.update({
        where: { id },
        data: data
      });

      return updatedReport;
    } catch (error) {
      console.error("Error in reportService.updateReport:", error);
      throw error;
    }
  },
};

// Investigation Document Service
export const investigationDocumentService = {
  // Create a new investigation document
  async createDocument(data: {
    reportId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storagePath: string;
    documentType: DocumentType;
    uploadedById: string;
    description?: string;
  }) {
    try {
      const document = await db.investigationDocument.create({
        data: {
          reportId: data.reportId,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          storagePath: data.storagePath,
          documentType: data.documentType,
          uploadedById: data.uploadedById,
          description: data.description,
        },
        include: {
          report: {
            select: { reportNumber: true, title: true }
          },
          uploadedBy: {
            select: { name: true }
          }
        }
      });

      return document;
    } catch (error) {
      console.error("Error in investigationDocumentService.createDocument:", error);
      throw error;
    }
  },

  // Get documents by report ID
  async getDocumentsByReportId(reportId: string) {
    try {
      const documents = await db.investigationDocument.findMany({
        where: { reportId },
        include: {
          uploadedBy: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return documents;
    } catch (error) {
      console.error("Error in investigationDocumentService.getDocumentsByReportId:", error);
      throw error;
    }
  },

  // Get all documents with optional filters
  async getAllDocuments(filters?: {
    reportId?: string;
    documentType?: DocumentType;
    uploadedById?: string;
  }) {
    try {
      const whereClause: any = {};

      if (filters) {
        if (filters.reportId) {
          whereClause.reportId = filters.reportId;
        }
        if (filters.documentType) {
          whereClause.documentType = filters.documentType;
        }
        if (filters.uploadedById) {
          whereClause.uploadedById = filters.uploadedById;
        }
      }

      const documents = await db.investigationDocument.findMany({
        where: whereClause,
        include: {
          report: {
            select: { reportNumber: true, title: true }
          },
          uploadedBy: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return documents;
    } catch (error) {
      console.error("Error in investigationDocumentService.getAllDocuments:", error);
      throw error;
    }
  },

  // Get document by ID
  async getDocumentById(id: string) {
    try {
      const document = await db.investigationDocument.findUnique({
        where: { id },
        include: {
          report: {
            select: { reportNumber: true, title: true }
          },
          uploadedBy: {
            select: { name: true }
          }
        }
      });

      return document;
    } catch (error) {
      console.error("Error in investigationDocumentService.getDocumentById:", error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(id: string) {
    try {
      const deletedDocument = await db.investigationDocument.delete({
        where: { id }
      });

      return deletedDocument;
    } catch (error) {
      console.error("Error in investigationDocumentService.deleteDocument:", error);
      throw error;
    }
  },
};