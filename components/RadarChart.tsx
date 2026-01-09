import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';

interface RadarChartProps {
  data: {
    label: string;
    value: number;
    icon?: string;
  }[];
  size?: number;
  maxValue?: number;
  color?: string;
  backgroundColor?: string;
}

export default function RadarChart({
  data,
  size = 280,
  maxValue = 10,
  color = '#007AFF',
  backgroundColor = '#f0f0f0',
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 40;
  const angleSlice = (Math.PI * 2) / data.length;
  const levels = 5; // 그리드 레벨 수

  // 각도를 좌표로 변환
  const getCoordinates = (angle: number, value: number) => {
    const adjustedAngle = angle - Math.PI / 2; // 12시 방향부터 시작
    const r = (value / maxValue) * radius;
    return {
      x: center + r * Math.cos(adjustedAngle),
      y: center + r * Math.sin(adjustedAngle),
    };
  };

  // 데이터 포인트 좌표 계산
  const dataPoints = data.map((item, index) => {
    const coords = getCoordinates(angleSlice * index, item.value);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  // 그리드 레벨 생성
  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const levelValue = ((i + 1) / levels) * maxValue;
    const points = data.map((_, index) => {
      const coords = getCoordinates(angleSlice * index, levelValue);
      return `${coords.x},${coords.y}`;
    }).join(' ');
    return points;
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* 배경 그리드 */}
        {gridLevels.map((points, index) => (
          <Polygon
            key={`grid-${index}`}
            points={points}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={1}
          />
        ))}

        {/* 축선 */}
        {data.map((_, index) => {
          const coords = getCoordinates(angleSlice * index, maxValue);
          return (
            <Line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={coords.x}
              y2={coords.y}
              stroke={backgroundColor}
              strokeWidth={1}
            />
          );
        })}

        {/* 데이터 영역 */}
        <Polygon
          points={dataPoints}
          fill={color}
          fillOpacity={0.3}
          stroke={color}
          strokeWidth={2}
        />

        {/* 데이터 포인트 */}
        {data.map((item, index) => {
          const coords = getCoordinates(angleSlice * index, item.value);
          return (
            <Circle
              key={`point-${index}`}
              cx={coords.x}
              cy={coords.y}
              r={5}
              fill={color}
            />
          );
        })}

        {/* 라벨 */}
        {data.map((item, index) => {
          const coords = getCoordinates(angleSlice * index, maxValue + 2);
          const adjustedAngle = angleSlice * index - Math.PI / 2;

          // 텍스트 정렬 결정
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';
          if (Math.cos(adjustedAngle) > 0.1) textAnchor = 'start';
          if (Math.cos(adjustedAngle) < -0.1) textAnchor = 'end';

          return (
            <G key={`label-${index}`}>
              <SvgText
                x={coords.x}
                y={coords.y}
                fontSize={12}
                fontWeight="600"
                fill="#333"
                textAnchor={textAnchor}
                alignmentBaseline="middle"
              >
                {item.icon} {item.label}
              </SvgText>
              <SvgText
                x={coords.x}
                y={coords.y + 14}
                fontSize={11}
                fontWeight="bold"
                fill={color}
                textAnchor={textAnchor}
                alignmentBaseline="middle"
              >
                {item.value}
              </SvgText>
            </G>
          );
        })}

        {/* 중앙 점 */}
        <Circle cx={center} cy={center} r={3} fill={backgroundColor} />
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
