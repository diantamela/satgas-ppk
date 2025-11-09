// lib/services/report-service.ts
import { db } from "@/db";
import { Prisma } from "@prisma/client";

// Report Service
export const reportService = {
  // Create a new report
  async createReport(data: {
    title: string;
    description: string;
    category: string;
    severity: string;
    isAnonymous?: boolean;
    reporterName?: string;
    reporterEmail?: string;
    respondentName: string;
    respondentPosition?: string;
    incidentDate?: Date | null;
    incidentLocation?: string | null;
    evidenceFiles?: string | null;
    assignedUserId?: string | null;
  }) {
    try {
      // Generate report number in format SPPK-YYYYMMDD-XXXX
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      const reportNumber = `SPPK-${timestamp}-${randomSuffix}`;
      
      const newReport = await db.report.create({
        data: {
          reportNumber,
          title: data.title,
          description: data.description,
          category: data.category,
          severity: data.severity,
          status: "pending", // Default status for new reports
          isAnonymous: data.isAnonymous || false,
          reporterName: data.isAnonymous ? null : data.reporterName || null,
          reporterEmail: data.isAnonymous ? null : data.reporterEmail || null,
          respondentName: data.respondentName,
          respondentPosition: data.respondentPosition || null,
          incidentDate: data.incidentDate || null,
          incidentLocation: data.incidentLocation || null,
          evidenceFiles: data.evidenceFiles || null,
          assignedUserId: data.assignedUserId || null,
        }
      });

      return newReport;
    } catch (error) {
      console.error("Error in reportService.createReport:", error);
      throw error;
    }
  },

  // Get report by ID
  async getReportById(id: number) {
    try {
      const report = await db.report.findUnique({
        where: { id }
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

  // Get all reports with optional filters
  async getAllReports(filters?: {
    status?: string;
    category?: string;
    severity?: string;
    reporterName?: string;
  }) {
    try {
      const whereClause: Prisma.ReportWhereInput = {};
      
      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          whereClause.status = filters.status;
        }
        if (filters.category) {
          whereClause.category = filters.category;
        }
        if (filters.severity) {
          whereClause.severity = filters.severity;
        }
        if (filters.reporterName) {
          whereClause.reporterName = {
            contains: filters.reporterName,
          };
        }
      }

      const reports = await db.report.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'asc'
        }
      });

      return reports;
    } catch (error) {
      console.error("Error in reportService.getAllReports:", error);
      throw error;
    }
  },

  // Update report status
  async updateReportStatus(id: number, status: string, statusField: 'status' | 'recommendationStatus' = 'status') {
    try {
      const updateData: any = {
        [statusField]: status,
      };

      // If updating to verified, set verifiedAt
      if (status === 'verified' && statusField === 'status') {
        updateData.verifiedAt = new Date();
      }
      // If updating to completed, set completedAt
      else if (status === 'completed' && statusField === 'status') {
        updateData.completedAt = new Date();
      }

      const updatedReport = await db.report.update({
        where: { id },
        data: updateData
      });

      return updatedReport;
    } catch (error) {
      console.error("Error in reportService.updateReportStatus:", error);
      throw error;
    }
  },

  // Update report details
  async updateReport(id: number, data: Prisma.ReportUpdateInput) {
    try {
      const updatedReport = await db.report.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
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
    reportId: number;
    documentType: string;
    title: string;
    content?: string;
    filePath?: string;
    uploadedBy?: string;
  }) {
    try {
      const newDocument = await db.investigationDocument.create({
        data: {
          reportId: data.reportId,
          documentType: data.documentType,
          title: data.title,
          content: data.content || null,
          filePath: data.filePath || null,
          uploadedBy: data.uploadedBy || null,
        }
      });

      return newDocument;
    } catch (error) {
      console.error("Error in investigationDocumentService.createDocument:", error);
      throw error;
    }
  },

  // Get investigation documents by report ID
  async getDocumentsByReportId(reportId: number) {
    try {
      const documents = await db.investigationDocument.findMany({
        where: { reportId },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return documents;
    } catch (error) {
      console.error("Error in investigationDocumentService.getDocumentsByReportId:", error);
      throw error;
    }
  },

  // Get document by ID
  async getDocumentById(id: number) {
    try {
      const document = await db.investigationDocument.findUnique({
        where: { id }
      });

      return document;
    } catch (error) {
      console.error("Error in investigationDocumentService.getDocumentById:", error);
      throw error;
    }
  },

  // Update investigation document
  async updateDocument(id: number, data: Prisma.InvestigationDocumentUpdateInput) {
    try {
      const updatedDocument = await db.investigationDocument.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      return updatedDocument;
    } catch (error) {
      console.error("Error in investigationDocumentService.updateDocument:", error);
      throw error;
    }
  },
};

// Notification Service
export const notificationService = {
  // Create a new notification
  async createNotification(data: {
    reportId: number;
    recipient: string;
    notificationType: string;
    message: string;
    status?: string;
  }) {
    try {
      const newNotification = await db.notification.create({
        data: {
          reportId: data.reportId,
          recipient: data.recipient,
          notificationType: data.notificationType,
          message: data.message,
          status: data.status || "pending",
        }
      });

      return newNotification;
    } catch (error) {
      console.error("Error in notificationService.createNotification:", error);
      throw error;
    }
  },

  // Get notifications by report ID
  async getNotificationsByReportId(reportId: number) {
    try {
      const notificationList = await db.notification.findMany({
        where: { reportId },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return notificationList;
    } catch (error) {
      console.error("Error in notificationService.getNotificationsByReportId:", error);
      throw error;
    }
  },

  // Get notification by ID
  async getNotificationById(id: number) {
    try {
      const notification = await db.notification.findUnique({
        where: { id }
      });

      return notification;
    } catch (error) {
      console.error("Error in notificationService.getNotificationById:", error);
      throw error;
    }
  },

  // Update notification status
  async updateNotificationStatus(id: number, status: string, sentAt?: Date) {
    try {
      const updatedNotification = await db.notification.update({
        where: { id },
        data: {
          status,
          sentAt: sentAt || new Date(),
          updatedAt: new Date(),
        }
      });

      return updatedNotification;
    } catch (error) {
      console.error("Error in notificationService.updateNotificationStatus:", error);
      throw error;
    }
  },
};