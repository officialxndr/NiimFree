/* Icon — renders a Lucide glyph as inline SVG.
   Relies on the global `lucide` UMD script being present on the page; it swaps the
   placeholder <i data-lucide> for a real <svg> on mount, so screenshots capture it. */

const { useRef, useEffect } = React;

export function Icon({ name, size = 20, strokeWidth, color, className = "", style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const placeholder = document.createElement("i");
    placeholder.setAttribute("data-lucide", name);
    host.appendChild(placeholder);
    if (typeof window !== "undefined" && window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons(); } catch (e) { /* lucide not ready yet */ }
    }
  }, [name]);

  const resolved = {
    width: size,
    height: size,
    color,
    ...(strokeWidth ? { "--icon-sw": strokeWidth } : {}),
    ...style,
  };

  return <span ref={ref} className={`nf-icon ${className}`} style={resolved} />;
}
