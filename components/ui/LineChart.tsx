"use client"

import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface LineChartProps {
  data: { time: string; value: number }[]
  categories?: string[]
  index?: string
  colors?: string[]
  yAxisWidth?: number
  showXAxis?: boolean
  showYAxis?: boolean
  showLegend?: boolean
  showGridLines?: boolean
  className?: string
}

export function LineChart(props: LineChartProps) {
  const {
    data,
    index = "month",
    colors = ["var(--color-desktop)"],
    showXAxis = true,
    showGridLines = true,
    className,
  } = props;

  const chartConfig = {
    desktop: {
      color: colors[0],
    },
  }

  return (
    <ChartContainer config={chartConfig} className={className}>
      <RechartsLineChart data={data} margin={{ left: 12, right: 12 }}>
        {showGridLines && <CartesianGrid vertical={false} />}
        {showXAxis && (
          <XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
        )}
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0357F8" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#0357F8" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill="url(#colorGradient)"
        />
        <Line 
          dataKey="value" 
          type="linear" 
          stroke={colors[0]} 
          strokeWidth={2} 
          dot={false}
        />
      </RechartsLineChart>
    </ChartContainer>
  )
}
