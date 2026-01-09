import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface PieChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
}

export default function PieChart({ data, size = 200 }: PieChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 10;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.emptyText}>데이터 없음</Text>
      </View>
    );
  }

  // 각 섹터의 경로 계산
  let currentAngle = -Math.PI / 2; // 12시 방향부터 시작
  const sectors = data.filter(item => item.value > 0).map((item) => {
    const angle = (item.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    // 라벨 위치 (섹터 중앙)
    const midAngle = startAngle + angle / 2;
    const labelRadius = radius * 0.65;
    const labelX = center + labelRadius * Math.cos(midAngle);
    const labelY = center + labelRadius * Math.sin(midAngle);

    return {
      ...item,
      d,
      labelX,
      labelY,
      percentage: Math.round((item.value / total) * 100),
    };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <G>
            {sectors.map((sector, index) => (
              <Path
                key={`sector-${index}`}
                d={sector.d}
                fill={sector.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </G>
        </Svg>
      </View>

      {/* 범례 */}
      <View style={styles.legend}>
        {data.filter(item => item.value > 0).map((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          return (
            <View key={`legend-${index}`} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
              <Text style={styles.legendValue}>{item.value}회 ({percentage}%)</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  legend: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
