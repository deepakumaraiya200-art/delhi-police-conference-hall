import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { IoIosArrowRoundUp } from "react-icons/io";
import { IoIosArrowRoundDown } from "react-icons/io";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  iconColor?: string;
  iconBg?: string;
}

export function StatisticsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: StatisticsCardProps) {
  return (
    
    <Card className={cn('animate-fade-in', className)}>
      <CardContent className="p-4">
        <div className=" ">
          <div className="space-y-2 flex flex-col justify-center items-center">
            <p className="text-sm font-medium text-[#535bad]">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {trend.value >= 0
                    ? <IoIosArrowRoundUp className='w-4 h-4 inline' />
                    : <IoIosArrowRoundDown className='w-4 h-4 inline' />
                  }
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
