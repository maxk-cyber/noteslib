export function getScrollSurface(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof HTMLElement)) return null;
  const surface = target.closest("[data-scroll-surface]");
  return surface instanceof HTMLElement ? surface : null;
}

export function canScrollSurface(
  element: HTMLElement,
  deltaY: number,
  deltaX = 0,
): boolean {
  const canScrollY = element.scrollHeight > element.clientHeight + 1;
  const canScrollX = element.scrollWidth > element.clientWidth + 1;

  if (canScrollY) {
    const atTop = element.scrollTop <= 0;
    const atBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    if (deltaY > 0 && !atBottom) return true;
    if (deltaY < 0 && !atTop) return true;
  }

  if (canScrollX) {
    const atLeft = element.scrollLeft <= 0;
    const atRight =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;
    if (deltaX > 0 && !atRight) return true;
    if (deltaX < 0 && !atLeft) return true;
  }

  return false;
}

export function isContainedSurface(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest("[data-3d-overlay]") ||
      target.closest("[data-scroll-surface]") ||
      target.closest("[data-diagram-hit]"),
  );
}

export function isViewportDragTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      "button, a, input, textarea, select, label, [data-diagram-hit], [data-scroll-surface], [data-3d-overlay]",
    ),
  );
}
