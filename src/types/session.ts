declare module '../core/middlewares/session/types' {
    interface ContextSessionData {
        adminId: string;
        tempAdminIdForSendEmailOtpCode: string;

        /**
         * Validation codes generated in `/api/ver-code` are stored here.
         */
        verCode?: string;
    }
}

export {};
