// lib/services/reports/report-service.ts
import { db } from "@/db";
import { ReportStatus, DocumentType, InvestigationMethod, InvestigationParty, AccessLevel, ActivityType } from "@prisma/client";

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
          },
          documents: {
            include: {
              uploadedBy: {
                select: { name: true }
              }
            },
            orderBy: { createdAt: 'desc' }
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
        where: { reportNumber },
        select: {
          id: true,
          reportNumber: true,
          title: true,
          description: true,
          incidentDate: true,
          incidentLocation: true,
          status: true,
          investigationProgress: true,
          decisionNotes: true,
          createdAt: true,
          updatedAt: true,
          documents: {
            where: { documentType: 'EVIDENCE' },
            include: {
              uploadedBy: {
                select: { name: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
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
        select: {
          id: true,
          reportNumber: true,
          title: true,
          description: true,
          incidentDate: true,
          incidentLocation: true,
          status: true,
          investigationProgress: true,
          decisionNotes: true,
          createdAt: true,
          updatedAt: true
        },
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
        select: {
          id: true,
          reportNumber: true,
          title: true,
          description: true,
          incidentDate: true,
          incidentLocation: true,
          status: true,
          investigationProgress: true,
          createdAt: true,
          updatedAt: true,
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

  // Schedule investigation (legacy method)
  async scheduleInvestigation(id: string, scheduledDate: Date, scheduledBy: string, scheduledNotes?: string) {
    try {
      const updatedReport = await db.report.update({
        where: { id },
        data: {
          status: ReportStatus.SCHEDULED,
          scheduledDate,
          scheduledBy,
          scheduledNotes
        }
      });

      return updatedReport;
    } catch (error) {
      console.error("Error in reportService.scheduleInvestigation:", error);
      throw error;
    }
  },

  // Create detailed investigation schedule
  async createDetailedInvestigationSchedule(data: {
    reportId: string;
    startDateTime?: Date;
    endDateTime?: Date;
    location: string;
    methods: string[];
    partiesInvolved: string[];
    otherPartiesDetails?: string;
    teamMembers: Array<{
      userId: string;
      role: string;
      customRole?: string;
    }>;
    consentObtained: boolean;
    consentDocumentation?: string;
    riskNotes?: string;
    planSummary?: string;
    followUpAction?: string;
    followUpDate?: Date;
    followUpNotes?: string;
    accessLevel: string;
    createdById: string;
  }) {
    try {
      // Create the detailed schedule
      const scheduleData: any = {
        reportId: data.reportId,
        location: data.location,
        methods: data.methods as InvestigationMethod[],
        partiesInvolved: data.partiesInvolved as InvestigationParty[],
        otherPartiesDetails: data.otherPartiesDetails,
        consentObtained: data.consentObtained,
        consentDocumentation: data.consentDocumentation,
        riskNotes: data.riskNotes,
        planSummary: data.planSummary,
        followUpAction: data.followUpAction,
        followUpDate: data.followUpDate,
        followUpNotes: data.followUpNotes,
        accessLevel: data.accessLevel as AccessLevel,
        createdById: data.createdById,
        teamMembers: {
          create: data.teamMembers.map(member => ({
            userId: member.userId,
            role: member.role as any,
            customRole: member.customRole
          }))
        }
      };

      // Add optional date fields if provided
      if (data.startDateTime) {
        scheduleData.startDateTime = data.startDateTime;
      }
      if (data.endDateTime) {
        scheduleData.endDateTime = data.endDateTime;
      }

      const schedule = await db.investigationSchedule.create({
        data: scheduleData,
        include: {
          teamMembers: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          createdBy: {
            select: { name: true }
          }
        }
      });

      // Create an activity record for this scheduled investigation
      const activityData: any = {
        reportId: data.reportId,
        scheduleId: schedule.id,
        activityType: 'SCHEDULED_INVESTIGATION' as any,
        title: `Jadwal Investigasi: ${data.planSummary || 'Investigasi Terjadwal'}`,
        description: `Investigasi terjadwal${data.startDateTime && data.endDateTime ? ` pada ${data.startDateTime.toLocaleString('id-ID')} - ${data.endDateTime.toLocaleString('id-ID')}` : ''} di ${data.location}. ${data.planSummary ? `Rencana: ${data.planSummary}` : ''}${data.methods.length > 0 ? ` Metode: ${data.methods.join(', ')}` : ''}${data.partiesInvolved.length > 0 ? ` Pihak terlibat: ${data.partiesInvolved.join(', ')}` : ''}${data.otherPartiesDetails ? ` Detail pihak lain: ${data.otherPartiesDetails}` : ''}${data.riskNotes ? ` Catatan risiko: ${data.riskNotes}` : ''}`,
        location: data.location,
        participants: data.teamMembers.map(member => member.userId || member.role).filter(Boolean),
        outcomes: data.planSummary || undefined,
        challenges: data.riskNotes || undefined,
        recommendations: data.followUpNotes || undefined,
        isConfidential: false,
        accessLevel: data.accessLevel as AccessLevel,
        conductedById: data.createdById
      };

      // Add optional date fields if provided
      if (data.startDateTime) {
        activityData.startDateTime = data.startDateTime;
      }
      if (data.endDateTime) {
        activityData.endDateTime = data.endDateTime;
      }

      const activity = await db.investigationActivity.create({
        data: activityData
      });

      // Update report status to SCHEDULED
      const reportUpdateData: any = {
        status: ReportStatus.SCHEDULED
      };

      // Add scheduledDate if startDateTime is provided
      if (data.startDateTime) {
        reportUpdateData.scheduledDate = data.startDateTime;
      }

      await db.report.update({
        where: { id: data.reportId },
        data: reportUpdateData
      });

      return schedule;
    } catch (error) {
      console.error("Error in reportService.createDetailedInvestigationSchedule:", error);
      throw error;
    }
  },

  // Get investigation schedule by report ID
  async getInvestigationScheduleByReportId(reportId: string) {
    try {
      const schedule = await db.investigationSchedule.findFirst({
        where: { reportId },
        include: {
          teamMembers: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          attachments: {
            include: {
              uploadedBy: {
                select: { name: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          createdBy: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return schedule;
    } catch (error) {
      console.error("Error in reportService.getInvestigationScheduleByReportId:", error);
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