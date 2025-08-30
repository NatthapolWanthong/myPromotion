window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const showOverlay = urlParams.get('showOverlay');

  if (showOverlay === '1') {
    const overlay = document.getElementById('condition-overlay');
    if (overlay) {
      overlay.classList.remove('d-none');
    }

    // ลบ showOverlay ออกจาก URL โดยไม่รีโหลดหน้า
    urlParams.delete('showOverlay');
    const newUrl = window.location.pathname + '?' + urlParams.toString();
    history.replaceState(null, '', newUrl);
  }
});
