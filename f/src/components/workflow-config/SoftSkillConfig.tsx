'use client';
import { SkillConfig } from './SkillConfig';

export function SoftSkillConfig({
  node,
  nodes,
  onConfigChange,
  positionId
}: {
  node: any;
  nodes?: any[];
  onConfigChange?: (config: any) => void;
  positionId?: number;
}) {
  return (
    <SkillConfig
      node={node}
      nodes={nodes}
      onConfigChange={onConfigChange}
      skillType='soft'
      positionId={positionId}
    />
  );
}
