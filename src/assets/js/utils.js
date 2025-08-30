// formatDate(dateStr, format = "dd-mm-yyyy")
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hour}:${min}:${sec}`;
}



// cloneDeep(obj)
export function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}



// findStatusById(statusList, id)
export function findStatusById(statusList, id) {
  return statusList.find((item) => String(item.id) === String(id));
}



// getStatusColor(statusData)
export function getStatusColor(id_main) {
  const map = {
    1: "#198754", // success
    2: "#0d6efd", // primary
    3: "#dc3545", // danger
    4: "#7b4b2a", // brown/expire
  };
  return map[id_main] || "#6c757d"; // default: gray
}



// toInputDateTimeFormat(datetime)
export function toInputDateTimeFormat(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16); // format: yyyy-MM-ddTHH:mm
}



// generateId(prefix = "id")
export function generateId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}



// debounce(fn, delay = 300)
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}