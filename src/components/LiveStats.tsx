import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { formatCompact } from "../attractors/shared/types";
import { StatLabel, StatValue } from "../attractors/shared/styles";

const StatsContainer = styled.span`
  display: inline-flex;
  align-items: center;
`;

interface LiveStatsProps {
  statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>;
}

export const LiveStats: React.FC<LiveStatsProps> = ({ statsRef }) => {
  const [stats, setStats] = useState({ maxHits: 0, totalIterations: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const pollStats = () => {
      setStats({
        maxHits: statsRef.current.maxHits,
        totalIterations: statsRef.current.totalIterations,
      });
      animationFrameId = requestAnimationFrame(pollStats);
    };

    animationFrameId = requestAnimationFrame(pollStats);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [statsRef]);

  return (
    <StatsContainer>
      <StatValue>{formatCompact(stats.maxHits)}</StatValue>
      <StatLabel style={{ margin: "0 4px" }}> / </StatLabel>
      <StatValue>{formatCompact(stats.totalIterations)}</StatValue>
    </StatsContainer>
  );
};
