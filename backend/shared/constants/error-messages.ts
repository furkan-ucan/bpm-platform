export const ERROR_MESSAGES = {
    PROCESS: {
        NOT_FOUND: 'Süreç bulunamadı',
        NAME_EXISTS: 'Bu isimde bir süreç zaten mevcut',
        INVALID_STATUS: 'Geçersiz süreç durumu',
        CREATION_FAILED: 'Süreç oluşturma işlemi başarısız oldu',
        UPDATE_FAILED: 'Süreç güncellenemedi',
        DELETE_FAILED: 'Süreç silme işlemi başarısız oldu',
        DELETE_SUCCESS: 'Süreç başarıyla silindi',
        INVALID_TRANSITION: 'Geçersiz durum geçişi',
        VALIDATION: {
            NAME_REQUIRED: 'Süreç adı zorunludur',
            NAME_TOO_LONG: 'Süreç adı en fazla 100 karakter olabilir',
            DESCRIPTION_TOO_LONG: 'Açıklama en fazla 500 karakter olabilir',
            BPMN_REQUIRED: 'BPMN XML zorunludur',
            INVALID_ID: 'Geçersiz süreç ID',
            UPDATED_AT_REQUIRED: 'updatedAt alanı zorunludur'
        }
    },
    VALIDATION: {
        REQUIRED_FIELD: 'Bu alan zorunludur',
        INVALID_FORMAT: 'Geçersiz format',
        INVALID_LENGTH: 'Geçersiz uzunluk',
        INVALID_ID: 'Geçersiz ID formatı'
    },
    AUTH: {
        UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmamaktadır',
        INVALID_TOKEN: 'Geçersiz veya süresi dolmuş token',
        INVALID_CREDENTIALS: 'Geçersiz kullanıcı adı veya şifre',
        TOKEN_EXPIRED: 'Oturum süresi doldu'
    },
    SYSTEM: {
        INTERNAL_ERROR: 'Sistemsel bir hata oluştu',
        SERVICE_UNAVAILABLE: 'Servis şu anda kullanılamıyor',
        UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu'
    },
    ENGINE: {
        ERROR: 'Motor hatası',
        UPDATE_FAILED: 'Süreç durumu güncellenemedi'
    },
    DB: {
        CONNECTION_ERROR: 'Veritabanı bağlantı hatası',
        QUERY_ERROR: 'Veritabanı sorgu hatası',
        DUPLICATE_KEY: 'Bu kayıt zaten mevcut'
    }
} as const;

export type ErrorMessageType = typeof ERROR_MESSAGES;