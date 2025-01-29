export enum AppointmentState {
    PENDING = 'PENDING', // pendiente de pago y realización
    ACTIVE = 'ACTIVO', // pagada la reserva pero aun no se realizo
    DELINQUENT = 'MOROSO', // se realizo la cita y no se pago
    COMPLETED = 'COMPLETADO', // ya se realizo la cita y fue pagada
    INACTIVE = 'INACTIVO', // no abono la cita y no se realizo
    CANCELLED = 'CANCELADO', // cancelo la cita
}   