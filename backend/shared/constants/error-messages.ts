export const ERROR_MESSAGES = {
    PROCESS: {
        NOT_FOUND: 'Süreç bulunamadı',
        NAME_EXISTS: 'Bu isimde bir süreç zaten mevcut',
        INVALID_STATUS: 'Geçersiz süreç durumu',
        CREATION_FAILED: 'Süreç oluşturma işlemi başarısız oldu',
        UPDATE_FAILED: 'Süreç güncellenemedi',
        DELETE_FAILED: 'Süreç silme işlemi başarısız oldu',
        INVALID_TRANSITION: 'Geçersiz durum geçişi'
    },
    VALIDATION: {
        REQUIRED_FIELD: 'Bu alan zorunludur',
        INVALID_FORMAT: 'Geçersiz format',
        INVALID_LENGTH: 'Geçersiz uzunluk',
        INVALID_ID: 'Geçersiz ID formatı'
    },
    AUTH: {
        UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmamaktadır',
        INVALID_TOKEN: 'Geçersiz veya süresi dolmuş token'
    },
    SYSTEM: {
        INTERNAL_ERROR: 'Sistemsel bir hata oluştu',
        SERVICE_UNAVAILABLE: 'Servis şu anda kullanılamıyor',
        UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu'
    },
    ENGINE: {
        ERROR: 'Motor hatası',
        UPDATE_FAILED: 'Süreç durumu güncellenemedi'
    }
} as const; 