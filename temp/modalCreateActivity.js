function getFormDB(url, divId) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var new_options = JSON.parse(this.responseText);
      var str = "";
      for (var item in new_options) {
        str += '<option value="' + item + '">' + new_options[item] + "</option>";
      }
      var selType = document.getElementById(divId);
      selType.innerHTML = str;
    }
  };
  xhr.send();
}
document.addEventListener("DOMContentLoaded", () => {
  
  getFormDB("./components/modal/getType.php", "form-type");
  getFormDB("./components/modal/getTarget.php", "form-target");
});