export class FormHelper {
  static generateOptions(obj, selectedValue) {
    let str = "";
    const selectedStr = String(selectedValue);
    // str += `<input class="form-control me-2 form-control-sm" type="search" placeholder="Search.." id="/" data-target="typeOptionCreateCampaignDropDown">`;
    for (const key in obj) {
      str += `<option value="${key}" ${selectedStr === key ? "selected" : ""}>${obj[key]}</option>`;
    }
    return str;
  }

  static translateStatus(stat) {
    switch (stat) {
      case "active": return "เปิดใช้งาน";
      case "pending": return "รอดำเนินการ";
      case "close": return "ปิดใช้งาน";
      default: return "อื่นๆ";
    }
  }
}
