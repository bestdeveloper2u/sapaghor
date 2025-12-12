import React from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'

export const STATUS_LABELS = {
  order: { en: 'Order', bn: 'অর্ডার' },
  design_sent: { en: 'Design Sent', bn: 'ডিজাইনে প্রেরণ' },
  proof_given: { en: 'Proof Given', bn: 'প্রুফ প্রদান' },
  proof_complete: { en: 'Proof Complete', bn: 'প্রুফ সম্পন্ন' },
  plate_setting: { en: 'Plate Setting', bn: 'প্লেট সেটিং এ প্রেরণ' },
  printing_complete: { en: 'Printing Complete', bn: 'ছাপা সম্পন্ন' },
  binding_sent: { en: 'Binding Sent', bn: 'বাইন্ডিং এ প্রেরণ' },
  order_ready: { en: 'Order Ready', bn: 'অর্ডার সম্পন্ন ও প্রস্তুত' },
  delivered: { en: 'Delivered', bn: 'ডেলিভারী প্রদান' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' }
}

export const WORKFLOW_STAGES = [
  'order',
  'design_sent',
  'proof_given',
  'proof_complete',
  'plate_setting',
  'printing_complete',
  'binding_sent',
  'order_ready',
  'delivered'
]

export const MATERIAL_LABELS = {
  plate: { en: 'Plate', bn: 'প্লেট' },
  paper: { en: 'Paper', bn: 'কাগজ' },
  duplicate: { en: 'Duplicate', bn: 'ডুপ্লিকেট' },
  ink: { en: 'Ink', bn: 'কালি' },
  printing: { en: 'Printing', bn: 'ছাপা' },
  binding: { en: 'Binding', bn: 'বাইন্ডিং' },
  laminating: { en: 'Laminating', bn: 'লেমিনেটিং' },
  others: { en: 'Others', bn: 'অন্যান্য' }
}

export const FEE_LABELS = {
  design_fee: { en: 'Design Fee', bn: 'ডিজাইন ফি' },
  urgency_fee: { en: 'Urgency Fee', bn: 'জরুরি ফি' },
  cashing_fee: { en: 'Cashing Fee', bn: 'ক্যাশিং ফি' },
  misc_fee: { en: 'Misc Fee', bn: 'বিবিধ ফি' }
}

export function getStatusLabel(status) {
  const label = STATUS_LABELS[status]
  if (label) {
    return `${label.en} (${label.bn})`
  }
  return status?.replace(/_/g, ' ')
}

export function getStatusBn(status) {
  return STATUS_LABELS[status]?.bn || status?.replace(/_/g, ' ')
}

export default function WorkflowProgress({ currentStatus }) {
  const currentIndex = WORKFLOW_STAGES.indexOf(currentStatus)
  const isCancelled = currentStatus === 'cancelled'

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Workflow Progress (ওয়ার্কফ্লো অবস্থা)</h2>
      
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <span className="text-red-600 font-medium text-lg">
            Cancelled (বাতিল)
          </span>
        </div>
      ) : (
        <div className="relative">
          <div className="flex justify-between items-center overflow-x-auto pb-4">
            {WORKFLOW_STAGES.map((stage, index) => {
              const isCompleted = index < currentIndex
              const isCurrent = index === currentIndex
              const isPending = index > currentIndex
              const label = STATUS_LABELS[stage]

              return (
                <div key={stage} className="flex flex-col items-center min-w-[80px] relative">
                  {index < WORKFLOW_STAGES.length - 1 && (
                    <div 
                      className={`absolute top-4 left-1/2 w-full h-0.5 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ transform: 'translateX(50%)' }}
                    />
                  )}
                  
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' : 
                    isCurrent ? 'bg-primary-500' : 
                    'bg-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : isCurrent ? (
                      <Clock className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      isCurrent ? 'text-primary-600' : 
                      isCompleted ? 'text-green-600' : 
                      'text-gray-500'
                    }`}>
                      {label?.bn}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {label?.en}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Current Stage: <span className="font-semibold text-primary-600">
                {getStatusLabel(currentStatus)}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Progress: {Math.round(((currentIndex + 1) / WORKFLOW_STAGES.length) * 100)}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function WorkflowSidebar({ ordersByStatus }) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Workflow Stages (ওয়ার্কফ্লো ধাপ)</h2>
      <div className="space-y-2">
        {WORKFLOW_STAGES.map((stage) => {
          const label = STATUS_LABELS[stage]
          const count = ordersByStatus?.[stage] || 0
          
          return (
            <div 
              key={stage} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  count > 0 ? 'bg-primary-500' : 'bg-gray-300'
                }`} />
                <div>
                  <span className="text-sm font-medium">{label?.bn}</span>
                  <span className="text-xs text-gray-500 ml-1">({label?.en})</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                count > 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </div>
          )
        })}
        
        <div className="border-t pt-2 mt-2">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div>
                <span className="text-sm font-medium">{STATUS_LABELS.cancelled.bn}</span>
                <span className="text-xs text-gray-500 ml-1">({STATUS_LABELS.cancelled.en})</span>
              </div>
            </div>
            <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
              {ordersByStatus?.cancelled || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
