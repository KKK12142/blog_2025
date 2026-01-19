// src/components/React/Arrow.jsx
// 힘 벡터 화살표 컴포넌트
import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export function Arrow({
  from = [0, 0, 0],
  to = [1, 0, 0],
  color = 'red',
  headLength = 0.2,
  headWidth = 0.1,
  label = '',
  labelOffset = 0.3,
  lineWidth = 4
}) {
  const { direction, length, labelPos } = useMemo(() => {
    const startVec = new THREE.Vector3(...from)
    const endVec = new THREE.Vector3(...to)
    const dir = endVec.clone().sub(startVec)
    const len = dir.length()
    dir.normalize()

    // 라벨 위치 (화살표 중간에서 수직으로 오프셋)
    const mid = startVec.clone().add(endVec).multiplyScalar(0.5)
    const perpendicular = new THREE.Vector3(-dir.y, dir.x, 0).normalize()
    const labelPosition = mid.clone().add(perpendicular.multiplyScalar(labelOffset))

    return {
      direction: dir,
      length: len,
      labelPos: [labelPosition.x, labelPosition.y, labelPosition.z]
    }
  }, [from, to, labelOffset])

  // 길이가 0이면 렌더링 안함
  if (length < 0.01) return null

  return (
    <group>
      {/* 화살표 본체 */}
      <arrowHelper
        args={[
          direction,
          new THREE.Vector3(...from),
          length,
          color,
          headLength,
          headWidth
        ]}
      />

      {/* 라벨 */}
      {label && (
        <Text
          position={labelPos}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {label}
        </Text>
      )}
    </group>
  )
}

// 기존 호환성을 위한 별칭
export const Arrow3D = Arrow
