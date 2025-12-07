// lib/services/reports/report-service.ts
import { db } from "@/db";
import { 
  ReportStatus, 
  DocumentType, 
  InvestigationMethod, 
  InvestigationParty, 
  AccessLevel
} from "@prisma/client";

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
      console.error("Error in reportService.processInvestigation:", error);
      throw error;
    }
  },

  // Create detailed investigation process
  async createDetailedInvestigationProcess(data: {
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
    uploadedFiles?: Array<{
      name: string;
      path: string;
      size: number;
      type: string;
    }>;
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

      // Handle attachments if provided
      if (data.uploadedFiles && data.uploadedFiles.length > 0) {
        scheduleData.attachments = {
          create: data.uploadedFiles.map((file: any) => ({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            storagePath: file.path,
            uploadedById: data.createdById
          }))
        };
      }

      const process = await db.investigationProcess.create({
        data: scheduleData
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

      return process;
    } catch (error) {
      console.error("Error in reportService.createDetailedInvestigationProcess:", error);
      throw error;
    }
  },

  // Create investigation process (for ongoing investigations)
  async createInvestigationProcess(data: {
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
    uploadedFiles?: Array<{
      name: string;
      path: string;
      size: number;
      type: string;
    }>;
    createdById: string;
  }) {
    try {
      // Create the investigation process
      const processData: any = {
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
        processData.startDateTime = data.startDateTime;
      }
      if (data.endDateTime) {
        processData.endDateTime = data.endDateTime;
      }

      // Handle attachments if provided
      if (data.uploadedFiles && data.uploadedFiles.length > 0) {
        processData.attachments = {
          create: data.uploadedFiles.map((file: any) => ({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            storagePath: file.path,
            uploadedById: data.createdById
          }))
        };
      }

      const process = await db.investigationProcess.create({
        data: processData
      });

      // Update report status to IN_PROGRESS (ongoing investigation)
      const reportUpdateData: any = {
        status: ReportStatus.IN_PROGRESS
      };

      // Add scheduledDate if startDateTime is provided (for backward compatibility)
      if (data.startDateTime) {
        reportUpdateData.scheduledDate = data.startDateTime;
      }

      await db.report.update({
        where: { id: data.reportId },
        data: reportUpdateData
      });

      return process;
    } catch (error) {
      console.error("Error in reportService.createInvestigationProcess:", error);
      throw error;
    }
  },

  // Get investigation process by report ID
  async getInvestigationProcessByReportId(reportId: string) {
    try {
      const process = await db.investigationProcess.findFirst({
        where: { reportId },
        orderBy: { createdAt: 'desc' }
      });

      return process;
    } catch (error) {
      console.error("Error in reportService.getInvestigationProcesseByReportId:", error);
      throw error;
    }
  },

  // Create comprehensive investigation schedule with all proposed features
  async createComprehensiveInvestigationSchedule(data: {
    // Basic information
    reportId: string;
    activityTitle: string;
    activityType: string; // Will be InvestigationActivityType enum after migration
    startDateTime?: Date;
    endDateTime?: Date;
    estimatedDuration?: number;
    location: string;
    
    // Investigation details
    methods: string[];
    partiesInvolved: string[];
    otherPartiesDetails?: string;
    
    // Equipment and logistics
    equipmentChecklist: string[]; // Will be EquipmentItem enum after migration
    otherEquipmentDetails?: string;
    
    // Team management
    teamMembers: Array<{
      userId: string;
      role: string;
      isChairPerson?: boolean;
      responsibilityNotes?: string;
    }>;
    
    // Companion requirements
    companionRequirements: string[]; // Will be CompanionRequirement enum after migration
    companionDetails?: string;
    
    // Internal notes and planning
    internalSatgasNotes?: string;
    riskNotes?: string;
    consentObtained: boolean;
    consentDocumentation?: string;
    
    // Follow-up planning
    nextStepsAfterCompletion?: string;
    followUpDate?: Date;
    followUpNotes?: string;
    
    // Access control
    accessLevel: string;
    
    // Auto-populated info
    caseAutoInfo?: any;
    caseSummary?: string;
    locationType?: string;
    purpose?: string;
    
    createdById: string;
  }) {
    try {
      // Create the comprehensive investigation schedule
      const scheduleData: any = {
        reportId: data.reportId,
        activityTitle: data.activityTitle,
        activityType: data.activityType, // Will be enum after migration
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        estimatedDuration: data.estimatedDuration,
        location: data.location,
        methods: data.methods as InvestigationMethod[],
        partiesInvolved: data.partiesInvolved as InvestigationParty[],
        otherPartiesDetails: data.otherPartiesDetails,
        equipmentChecklist: data.equipmentChecklist, // Will be enum after migration
        otherEquipmentDetails: data.otherEquipmentDetails,
        companionRequirements: data.companionRequirements, // Will be enum after migration
        companionDetails: data.companionDetails,
        internalSatgasNotes: data.internalSatgasNotes,
        riskNotes: data.riskNotes,
        consentObtained: data.consentObtained,
        consentDocumentation: data.consentDocumentation,
        nextStepsAfterCompletion: data.nextStepsAfterCompletion,
        followUpDate: data.followUpDate,
        followUpNotes: data.followUpNotes,
        accessLevel: data.accessLevel as AccessLevel,
        caseAutoInfo: data.caseAutoInfo,
        caseSummary: data.caseSummary,
        createdById: data.createdById,
        teamMembers: {
          create: data.teamMembers.map(member => ({
            userId: member.userId,
            role: member.role as any,
            isChairPerson: member.isChairPerson || false,
            responsibilityNotes: member.responsibilityNotes
          }))
        }
      };

      const process = await db.investigationProcess.create({
        data: scheduleData
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

      return process;
    } catch (error) {
      console.error("Error in reportService.createComprehensiveInvestigationSchedule:", error);
      throw error;
    }
  },

  // Get reports with IN_PROGRESS status that need scheduling
  async getInProgressReportsNeedingSchedule() {
    try {
      const reports = await db.report.findMany({
        where: {
          status: 'IN_PROGRESS',
          scheduledDate: null
        },
        include: {
          reporter: {
            select: { name: true, email: true }
          },
          documents: {
            where: { documentType: 'EVIDENCE' },
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return reports;
    } catch (error) {
      console.error("Error in reportService.getInProgressReportsNeedingSchedule:", error);
      throw error;
    }
  },

  // Automatically schedule IN_PROGRESS reports
  async autoScheduleInProgressReports(scheduledBy: string, scheduleConfig?: {
    defaultLocation?: string;
    defaultDuration?: number; // in hours
    autoAssignTeam?: boolean;
  }) {
    try {
      // Get all IN_PROGRESS reports that don't have scheduling yet
      const inProgressReports = await this.getInProgressReportsNeedingSchedule();
      
      const scheduledReports = [];
      
      for (const report of inProgressReports) {
        // Calculate suggested schedule date (next available slot)
        const suggestedDate = await this.getNextAvailableScheduleSlot();
        
        // Generate default schedule data
        const scheduleData = {
          scheduledDate: suggestedDate,
          scheduledBy,
          scheduledNotes: `Penjadwalan otomatis - Laporan: ${report.title} (${report.reportNumber}). Lokasi: ${scheduleConfig?.defaultLocation || 'Ruang pertemuan satgas'}. Estimasi durasi: ${scheduleConfig?.defaultDuration || 2} jam.`
        };

        // Update report with scheduling information
        const updatedReport = await db.report.update({
          where: { id: report.id },
          data: scheduleData,
          include: {
            reporter: {
              select: { name: true, email: true }
            }
          }
        });

        scheduledReports.push(updatedReport);


      }

      return {
        success: true,
        scheduledCount: scheduledReports.length,
        scheduledReports
      };
    } catch (error) {
      console.error("Error in reportService.autoScheduleInProgressReports:", error);
      throw error;
    }
  },

  // Get next available schedule slot (simple implementation)
  async getNextAvailableScheduleSlot() {
    try {
      // Simple logic: find the next available time slot
      const now = new Date();
      
      // Start from tomorrow at 9 AM
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      // Check if there are conflicts with existing scheduled reports
      const existingSchedules = await db.report.findMany({
        where: {
          scheduledDate: {
            gte: tomorrow,
            lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) // Same day
          },
          status: 'SCHEDULED'
        },
        select: { scheduledDate: true }
      });

      // If no conflicts, return tomorrow 9 AM
      if (existingSchedules.length === 0) {
        return tomorrow;
      }

      // Find next available 2-hour slot
      let proposedTime = new Date(tomorrow);
      const workHours = { start: 9, end: 17 }; // 9 AM to 5 PM
      const slotDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

      for (let day = 1; day <= 7; day++) { // Check up to a week ahead
        for (let hour = workHours.start; hour <= workHours.end - 2; hour++) {
          proposedTime = new Date(tomorrow);
          proposedTime.setDate(tomorrow.getDate() + day - 1);
          proposedTime.setHours(hour, 0, 0, 0);

          const proposedEnd = new Date(proposedTime.getTime() + slotDuration);
          
          // Check if this slot conflicts with existing schedules
          const hasConflict = existingSchedules.some(schedule => {
            const scheduleDate = schedule.scheduledDate!;
            const scheduleEnd = new Date(scheduleDate.getTime() + slotDuration);
            
            return (proposedTime < scheduleEnd && proposedEnd > scheduleDate);
          });

          if (!hasConflict) {
            return proposedTime;
          }
        }
      }

      // If no slot found in the next week, return next Monday 9 AM
      const nextMonday = new Date(tomorrow);
      const daysUntilMonday = (1 + 7 - nextMonday.getDay()) % 7 || 7;
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      nextMonday.setHours(9, 0, 0, 0);

      return nextMonday;
    } catch (error) {
      console.error("Error in reportService.getNextAvailableScheduleSlot:", error);
      // Fallback: return tomorrow 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    }
  },

  // Get scheduling statistics
  async getSchedulingStats() {
    try {
      const [
        totalReports,
        inProgressReports,
        scheduledReports,
        completedReports,
        pendingScheduling
      ] = await Promise.all([
        db.report.count(),
        db.report.count({ where: { status: 'IN_PROGRESS' } }),
        db.report.count({ where: { status: 'SCHEDULED' } }),
        db.report.count({ where: { status: 'COMPLETED' } }),
        db.report.count({ 
          where: { 
            status: 'IN_PROGRESS', 
            scheduledDate: null 
          } 
        })
      ]);

      return {
        total: totalReports,
        inProgress: inProgressReports,
        scheduled: scheduledReports,
        completed: completedReports,
        pendingScheduling
      };
    } catch (error) {
      console.error("Error in reportService.getSchedulingStats:", error);
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