import { motion } from 'framer-motion';
import { Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

const steps = [
  { key: 'pending', label: 'অর্ডার গৃহীত', icon: Clock },
  { key: 'processing', label: 'প্রস্তুত হচ্ছে', icon: Package },
  { key: 'shipped', label: 'ডেলিভারিতে', icon: Truck },
  { key: 'delivered', label: 'ডেলিভারি সম্পন্ন', icon: CheckCircle2 },
];

interface OrderTimelineProps {
  currentStatus: string;
}

const OrderTimeline = ({ currentStatus }: OrderTimelineProps) => {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <XCircle className="h-6 w-6 text-destructive shrink-0" />
        <div>
          <p className="font-semibold text-destructive">অর্ডার বাতিল হয়েছে</p>
          <p className="text-sm text-muted-foreground">এই অর্ডারটি বাতিল করা হয়েছে</p>
        </div>
      </div>
    );
  }

  // Legacy 'payment_received' rows map onto the processing stage (cash on delivery only)
  const effectiveStatus = currentStatus === 'payment_received' ? 'processing' : currentStatus;
  const currentIndex = steps.findIndex((s) => s.key === effectiveStatus);

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="font-bold mb-5">অর্ডার ট্র্যাকিং</h2>
      <div className="relative">
        {steps.map((step, i) => {
          const isCompleted = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex gap-4 relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[19px] top-10 w-0.5 h-[calc(100%-16px)]">
                  <motion.div
                    className={`w-full h-full ${isCompleted && i < currentIndex ? 'bg-primary' : 'bg-border'}`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.15, duration: 0.3 }}
                    style={{ transformOrigin: 'top' }}
                  />
                </div>
              )}

              {/* Icon circle */}
              <motion.div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
              >
                <Icon className="h-4 w-4" />
              </motion.div>

              {/* Label */}
              <motion.div
                className={`pt-2 pb-8 ${i === steps.length - 1 ? 'pb-0' : ''}`}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.1, duration: 0.3 }}
              >
                <p className={`text-sm font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <motion.p
                    className="text-xs text-primary font-medium mt-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    বর্তমান অবস্থা
                  </motion.p>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
