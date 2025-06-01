import { useEffect, useRef } from "react";
import * as d3 from "d3";

const SunburstCHART = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data) return;

    const width = 2000;
    const height = 1000;
    const radius = 150;

    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );

    const hierarchy = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const root = d3.partition().size([2 * Math.PI, hierarchy.height + 1])(
      hierarchy
    );
    root.each((d) => (d.current = d));

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => d.y0 * radius)
      .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3
      .select(ref.current)
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "12.5px sans-serif");

    svg.selectAll("*").remove(); // Clear previous render

    const g = svg.append("g");

    const path = g
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", (d) =>
        arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("pointer-events", (d) => (arcVisible(d.current) ? "auto" : "none"))
      .attr("d", (d) => arc(d.current));

    path
      .filter((d) => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    const format = d3.format(",d");
    path.append("title").text(
      (d) =>
        `${d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join("/")}\n${format(d.value)}`
    );

    const label = g
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", (d) => +labelVisible(d.current))
      .attr("transform", (d) => labelTransform(d.current))
      .text((d) => d.data.name);

    const parent = g
      .append("g")
      .datum({}) // will be set in click handler
      .attr("pointer-events", "all");

    const backIconSVGString = `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><path opacity="1" fill="#1E3050" d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160zm352-160l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L301.3 256 438.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z"/></svg>`;
    const backIcon = parent
      .append("image")
      .attr(
        "xlink:href",
        "data:image/svg+xml," + encodeURIComponent(backIconSVGString)
      )
      .attr("width", 16)
      .attr("height", 16)
      .attr("x", -8)
      .attr("y", -8)
      .style("cursor", "pointer");

    const backText = parent
      .append("text")
      .text("Back")
      .attr("text-anchor", "middle")
      .attr("dy", 18);

    hideBack();
    parent.on("click", null);

    function clicked(event, p) {
      parent.datum(p.parent || root);

      root.each((d) => {
        d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        };
      });

      const t = svg.transition().duration(750);

      path
        .transition(t)
        .tween("data", (d) => {
          const i = d3.interpolate(d.current, d.target);
          return (t) => (d.current = i(t));
        })
        .attr("fill-opacity", (d) =>
          arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
        )
        .attr("pointer-events", (d) => (arcVisible(d.target) ? "auto" : "none"))
        .attrTween("d", (d) => () => arc(d.current));

      label
        .transition(t)
        .attr("fill-opacity", (d) => +labelVisible(d.target))
        .attrTween("transform", (d) => () => labelTransform(d.current));

      if (p === root) {
        hideBack();
      } else {
        showBack();
      }
    }

    function hideBack() {
      backIcon.style("cursor", "default").attr("xlink:href", "");
      backText.text("");
      parent.on("click", null);
    }

    function showBack() {
      backIcon
        .style("cursor", "pointer")
        .attr(
          "xlink:href",
          "data:image/svg+xml," + encodeURIComponent(backIconSVGString)
        );
      backText.text("back");

      parent.on("click", clicked);
    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  }, [data]);

  return <svg ref={ref} />;
};

export default SunburstCHART;
