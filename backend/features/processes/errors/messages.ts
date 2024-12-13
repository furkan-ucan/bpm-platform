export const PROCESS_ERROR_MESSAGES = {
    NOT_FOUND: 'Süreç bulunamadı',
    NAME_EXISTS: 'Bu isimde bir süreç zaten mevcut',
    INVALID_STATUS: 'Geçersiz süreç durumu',
    CREATION_FAILED: 'Süreç oluşturma işlemi başarısız oldu',
    UPDATE_FAILED: 'Süreç güncellenemedi',
    DELETE_FAILED: 'Süreç silme işlemi başarısız oldu',
    INVALID_TRANSITION: 'Geçersiz durum geçişi',
    VALIDATION: {
        NAME_REQUIRED: 'Süreç adı zorunludur',
        NAME_TOO_LONG: 'Süreç adı en fazla 100 karakter olabilir',
        DESCRIPTION_TOO_LONG: 'Açıklama en fazla 500 karakter olabilir',
        BPMN_REQUIRED: 'BPMN XML zorunludur',
        INVALID_ID: 'Geçersiz süreç ID',
        UPDATED_AT_REQUIRED: 'updatedAt alanı zorunludur'
    },
    DELETE_SUCCESS: 'Süreç başarıyla silindi'
} as const; 