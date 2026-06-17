import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Building2,
  Calendar,
  Users,
  Clock,
  Activity,
} from 'lucide-react';

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#14b8a6'];

// ── Most Used Rooms ─────────────────────────────────────────────────────────
const mostUsedRoomsData = [
  { name: 'Adarsh Auditorium', bookings: 48, fill: COLORS[0] },
  { name: 'Media Conference Hall', bookings: 42, fill: COLORS[1] },
  { name: 'Room 203', bookings: 38, fill: COLORS[2] },
  { name: 'Room 727', bookings: 35, fill: COLORS[3] },
  { name: 'Room 326', bookings: 31, fill: COLORS[4] },
  { name: 'Conference Hall 17th', bookings: 28, fill: COLORS[5] },
  { name: 'Room 107', bookings: 25, fill: COLORS[6] },
  { name: 'Room 420', bookings: 22, fill: COLORS[7] },
];

// ── Booking by Department ───────────────────────────────────────────────────
const departmentData = [
  { name: 'IT Center', value: 68 },
  { name: 'HRD', value: 52 },
  { name: 'Traffic', value: 45 },
  { name: 'CP Secretariat', value: 40 },
  { name: 'DCP/GA', value: 35 },
  { name: 'Media Cell', value: 30 },
  { name: 'Special Cell', value: 28 },
  { name: 'Others', value: 42 },
];

// ── Monthly Trend ───────────────────────────────────────────────────────────
const monthlyTrendData = [
  { month: 'Jan', bookings: 85, cancellations: 12 },
  { month: 'Feb', bookings: 92, cancellations: 8 },
  { month: 'Mar', bookings: 110, cancellations: 15 },
  { month: 'Apr', bookings: 98, cancellations: 10 },
  { month: 'May', bookings: 125, cancellations: 18 },
  { month: 'Jun', bookings: 140, cancellations: 14 },
  { month: 'Jul', bookings: 132, cancellations: 11 },
  { month: 'Aug', bookings: 118, cancellations: 16 },
  { month: 'Sep', bookings: 145, cancellations: 12 },
  { month: 'Oct', bookings: 155, cancellations: 9 },
  { month: 'Nov', bookings: 138, cancellations: 13 },
  { month: 'Dec', bookings: 112, cancellations: 20 },
];

// ── Room Utilization by Tower ───────────────────────────────────────────────
const towerUtilizationData = [
  { tower: 'Tower I', morning: 65, afternoon: 82, evening: 45 },
  { tower: 'Tower II', morning: 55, afternoon: 70, evening: 38 },
  { tower: 'Bridge Tower', morning: 40, afternoon: 58, evening: 25 },
];

// ── Summary Stats ───────────────────────────────────────────────────────────
const summaryStats = [
  { label: 'Total Bookings', value: '1,460', icon: Calendar, change: '+12%', positive: true },
  { label: 'Avg. Daily Bookings', value: '8.2', icon: Activity, change: '+5%', positive: true },
  { label: 'Avg. Duration', value: '1.8h', icon: Clock, change: '-3%', positive: false },
  { label: 'Unique Users', value: '156', icon: Users, change: '+18%', positive: true },
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Insights into room usage, booking trends, and department activity"
      >
        <Badge variant="secondary" className="gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          Last 12 months
        </Badge>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={
                    stat.positive
                      ? 'text-xs font-medium text-emerald-600 dark:text-emerald-400'
                      : 'text-xs font-medium text-red-600 dark:text-red-400'
                  }
                >
                  {stat.change} from last year
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Rooms — Horizontal Bar Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-base">Most Used Rooms</CardTitle>
                <CardDescription className="text-xs">
                  Total bookings per room this year
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={mostUsedRoomsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={140}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="bookings" radius={[0, 4, 4, 0]} barSize={18}>
                  {mostUsedRoomsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking by Department — Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <PieChartIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-base">Bookings by Department</CardTitle>
                <CardDescription className="text-xs">
                  Distribution of bookings across departments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [`${value} bookings`, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend — Line Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base">Monthly Booking Trend</CardTitle>
                <CardDescription className="text-xs">
                  Bookings vs cancellations over the year
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={monthlyTrendData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4f46e5' }}
                  activeDot={{ r: 6, fill: '#4f46e5' }}
                  name="Bookings"
                />
                <Line
                  type="monotone"
                  dataKey="cancellations"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ef4444' }}
                  activeDot={{ r: 5, fill: '#ef4444' }}
                  name="Cancellations"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Room Utilization by Tower — Stacked Bar Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base">Room Utilization by Tower</CardTitle>
                <CardDescription className="text-xs">
                  Average utilization rate (%) by time of day
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={towerUtilizationData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tower" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="morning"
                  stackId="utilization"
                  fill="#4f46e5"
                  radius={[0, 0, 0, 0]}
                  name="Morning (8AM–12PM)"
                />
                <Bar
                  dataKey="afternoon"
                  stackId="utilization"
                  fill="#06b6d4"
                  radius={[0, 0, 0, 0]}
                  name="Afternoon (12PM–5PM)"
                />
                <Bar
                  dataKey="evening"
                  stackId="utilization"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="Evening (5PM–8PM)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;
