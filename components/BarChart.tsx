import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

interface BarChartProps {
  data: {
    label: string;
    value: number;
  }[];
  width?: number;
  height?: number;
  barColor?: string;
}

export default function BarChart({
  data,
  width = 320,
  height = 200,
  barColor = '#007AFF',
}: BarChartProps) {
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = (chartWidth / data.length) * 0.6;
  const barGap = (chartWidth / data.length) * 0.4;

  // Y축 눈금 계산
  const yTicks = 4;
  const tickInterval = Math.ceil(maxValue / yTicks);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Y축 눈금선 */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = paddingTop + chartHeight - (i / yTicks) * chartHeight;
          const value = tickInterval * i;
          return (
            <React.Fragment key={`tick-${i}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#eee"
                strokeWidth={1}
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                fontSize={10}
                fill="#999"
                textAnchor="end"
              >
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* 막대 */}
        {data.map((item, index) => {
          const barHeight = (item.value / (tickInterval * yTicks)) * chartHeight;
          const x = paddingLeft + index * (barWidth + barGap) + barGap / 2;
          const y = paddingTop + chartHeight - barHeight;

          return (
            <React.Fragment key={`bar-${index}`}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                rx={4}
              />
              {/* 값 표시 */}
              {item.value > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize={10}
                  fill="#333"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {item.value}
                </SvgText>
              )}
              {/* 라벨 */}
              <SvgText
                x={x + barWidth / 2}
                y={height - paddingBottom + 15}
                fontSize={10}
                fill="#666"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
