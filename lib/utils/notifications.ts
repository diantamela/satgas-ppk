import { db } from "@/db";
import { NotificationType } from "@prisma/client";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

/**
 * Create an in-app notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedEntityId: params.relatedEntityId || null,
        relatedEntityType: params.relatedEntityType || null,
        isRead: false,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Send notification when report status changes
 */
export async function notifyReportStatusChange(
  reportId: string,
  reporterId: string,
  reportNumber: string,
  oldStatus: string,
  newStatus: string,
  satgasName: string
) {
  const statusMessages: { [key: string]: { title: string; message: string } } = {
    'PENDING': {
      title: 'Laporan Diterima',
      message: `Laporan ${reportNumber} telah diterima dan sedang menunggu verifikasi oleh tim satgas.`
    },
    'VERIFIED': {
      title: 'Laporan Diverifikasi',
      message: `Laporan ${reportNumber} telah diverifikasi oleh ${satgasName} dan dinyatakan valid.`
    },
    'SCHEDULED': {
      title: 'Jadwal Investigasi Ditentukan',
      message: `Investigasi untuk laporan ${reportNumber} telah dijadwalkan oleh ${satgasName}.`
    },
    'IN_PROGRESS': {
      title: 'Investigasi Dimulai',
      message: `Investigasi untuk laporan ${reportNumber} telah dimulai oleh ${satgasName}.`
    },
    'COMPLETED': {
      title: 'Investigasi Selesai',
      message: `Investigasi untuk laporan ${reportNumber} telah selesai diproses oleh ${satgasName}.`
    },
    'REJECTED': {
      title: 'Laporan Ditolak',
      message: `Laporan ${reportNumber} telah ditolak oleh ${satgasName}. Silakan hubungi tim support untuk informasi lebih lanjut.`
    }
  };

  const statusInfo = statusMessages[newStatus] || {
    title: 'Status Laporan Diperbarui',
    message: `Status laporan ${reportNumber} telah diperbarui dari ${oldStatus} menjadi ${newStatus} oleh ${satgasName}.`
  };

  return await createNotification({
    userId: reporterId,
    type: NotificationType.REPORT_STATUS_CHANGED,
    title: statusInfo.title,
    message: statusInfo.message,
    relatedEntityId: reportId,
    relatedEntityType: 'REPORT',
  });
}

/**
 * Send notification when investigation process is created
 */
export async function notifyInvestigationProcessCreated(
  reportId: string,
  reporterId: string,
  reportNumber: string,
  satgasName: string
) {
  return await createNotification({
    userId: reporterId,
    type: NotificationType.INVESTIGATION_SCHEDULED,
    title: 'Proses Investigasi Dimulai',
    message: `Proses investigasi untuk laporan ${reportNumber} telah dimulai oleh ${satgasName}. Tim kami akan menghubungi Anda jika diperlukan informasi tambahan.`,
    relatedEntityId: reportId,
    relatedEntityType: 'REPORT',
  });
}

/**
 * Send notification when recommendation is created
 */
export async function notifyRecommendationCreated(
  reportId: string,
  reporterId: string,
  reportNumber: string,
  satgasName: string
) {
  return await createNotification({
    userId: reporterId,
    type: NotificationType.NEW_RECOMMENDATION,
    title: 'Rekomendasi Diterbitkan',
    message: `Rekomendasi untuk laporan ${reportNumber} telah disiapkan oleh ${satgasName}. Silakan cek dashboard Anda untuk melihat detail rekomendasi.`,
    relatedEntityId: reportId,
    relatedEntityType: 'REPORT',
  });
}

/**
 * Send notification when report is updated
 */
export async function notifyReportUpdated(
  reportId: string,
  reporterId: string,
  reportNumber: string,
  satgasName: string,
  updateType: string
) {
  const updateMessages: { [key: string]: { title: string; message: string } } = {
    'note_added': {
      title: 'Catatan Ditambahkan',
      message: `Catatan baru telah ditambahkan ke laporan ${reportNumber} oleh ${satgasName}.`
    },
    'file_uploaded': {
      title: 'Berkas Diunggah',
      message: `Berkas baru telah diunggah ke laporan ${reportNumber} oleh ${satgasName}.`
    },
    'general_update': {
      title: 'Laporan Diperbarui',
      message: `Laporan ${reportNumber} telah diperbarui oleh ${satgasName}.`
    }
  };

  const updateInfo = updateMessages[updateType] || updateMessages['general_update'];

  return await createNotification({
    userId: reporterId,
    type: NotificationType.DOCUMENT_UPLOADED,
    title: updateInfo.title,
    message: updateInfo.message,
    relatedEntityId: reportId,
    relatedEntityType: 'REPORT',
  });
}