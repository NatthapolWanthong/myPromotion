export function highlightCurrentStatus(StatusData) {
  const activeCard = document.querySelector(".cards.expanded");
  if (!activeCard) return;

  const currentStatusId = Number(activeCard.dataset.status);
  if (!currentStatusId) return;

  document.querySelectorAll(".SelectStatus-button").forEach((btn) => {
    const btnStatusId = parseInt(btn.dataset.statusId);
    
    if (btnStatusId === currentStatusId) {
      btn.classList.add("active-status");
    } else {
      btn.classList.remove("active-status");
    }
  });
}
