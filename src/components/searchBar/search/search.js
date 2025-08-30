// document.querySelectorAll('input[data-target]').forEach(input => {
//   input.addEventListener("input", () => {
//     const targetId = input.dataset.target;
//     filterFunction(input, targetId);
//   });
// });


// export function filterFunction(inputElement, dropdownId) {
//   const filter = inputElement.value.toUpperCase();
//   const dropdown = document.getElementById(dropdownId);
//   const items = dropdown.getElementsByTagName("li");

//   for (let i = 0; i < items.length; i++) {
//     const txtValue = items[i].textContent || items[i].innerText;
//     items[i].style.display = txtValue.toUpperCase().includes(filter) ? "" : "none";
//   }
// }