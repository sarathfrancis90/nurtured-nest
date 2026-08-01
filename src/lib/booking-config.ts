import type { ServiceType } from '@/lib/validation';

export type ServiceConfig = {
  id: ServiceType;
  label: string;
  durationMinutes: number;
  description: string;
};

export const SERVICES: ServiceConfig[] = [
  {
    id: 'free-15-min-call',
    label: 'Free 15-min Consultation',
    durationMinutes: 15,
    description: 'A short introductory call.',
  },
  {
    id: 'prenatal-consult',
    label: 'Prenatal Consultation',
    durationMinutes: 30,
    description: 'Prenatal planning and emotional prep support.',
  },
  {
    id: 'birth-planning',
    label: 'Birth Planning Session',
    durationMinutes: 30,
    description: 'Detailed birth plan discussion and partner guidance.',
  },
  {
    id: 'postpartum-consult',
    label: 'Postpartum Consult',
    durationMinutes: 30,
    description: 'Support during your postpartum recovery period.',
  },
];

export const LEAD_TIME_MINUTES = 120;
export const MAX_DAILY_BOOKINGS = 6;
export const SLOT_INTERVAL_MINUTES = 30;
export const MAX_RETRY_COUNT = 5;

export const OPEN_HOURS: Record<
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun',
  [string, string] | []
> = {
  mon: ['09:00', '17:00'],
  tue: ['09:00', '17:00'],
  wed: ['09:00', '17:00'],
  thu: ['09:00', '17:00'],
  fri: ['09:00', '17:00'],
  sat: ['10:00', '14:00'],
  sun: [],
};
