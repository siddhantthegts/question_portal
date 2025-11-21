import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function MathRenderer({ html }) {
  if (!html) return null;

  // Parse the HTML
  const container = document.createElement("div");
  container.innerHTML = html;

  // Find formula tag
  const formula = container.querySelector("span.ql-formula");

  // If formula exists, render using katex
  if (formula) {
    const tex = formula.dataset.value;

    try {
      const rendered = katex.renderToString(tex, {
        throwOnError: false,
      });

      return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
    } catch (e) {
      console.error("KaTeX parse error:", e);
      return <span>{tex}</span>;
    }
  }

  // Otherwise render the normal HTML
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
