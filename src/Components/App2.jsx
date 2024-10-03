import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3Example = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    const data = [12, 25, 35, 45, 60, 20];

    const svg = d3.select(d3Container.current)
      .append('svg')
      .attr('width', 400)
      .attr('height', 200);

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 50)
      .attr('y', (d) => 200 - d * 4)
      .attr('width', 40)
      .attr('height', (d) => d * 4)
      .attr('fill', 'blue');
  }, []);

  return <div ref={d3Container}></div>;
};

export default D3Example;
