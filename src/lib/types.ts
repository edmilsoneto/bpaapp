export type PaymentStatus = 'PAID' | 'PENDING'

export interface MonthOption {
  value: string
  label: string
}

export interface Payment {
  paymentId?: string | null
  studentId: string
  studentName: string
  studentPhone?: string | null
  monthlyFee: number
  status: PaymentStatus
}

export interface Cost {
  name: string
  value: number
  status: PaymentStatus
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
}

export interface TrainingDay {
  id: string
  month: string
  day: number
  date: string
}
