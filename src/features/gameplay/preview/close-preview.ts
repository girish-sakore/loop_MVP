/** Closes a preview tab. If the browser refuses (tab wasn't opened by script), go to `fallback` instead. */
export function closePreviewTab(fallback: string, go: (href: string) => void) {
  window.close();
  setTimeout(() => {
    if (!window.closed) go(fallback); // still here, so close was blocked
  }, 200);
}