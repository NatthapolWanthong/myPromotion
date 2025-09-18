export class API {
  static fetchData(url, method = "POST", data = null) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject("JSON parsing error: " + e.message);
            }
          } else {
            reject("HTTP error: " + xhr.status);
          }
        }
      };
      xhr.onerror = () => reject("Request failed");

      if (data && typeof data === "object") {
        xhr.send(JSON.stringify(data)); // ✅ ส่ง JSON ตรงตาม Content-Type
      } else {
        xhr.send(); // ✅ ส่งว่างๆ ถ้าไม่มี data
      }
    });
  }

  // ==================================================================================================================
  // ==================================================== Campaign ====================================================
  // ==================================================================================================================

  // ดึงข้อมูล
  static getFormOptions() {
    return API.fetchData("/myPromotion/src/connection/getData.php?include=type,target,promotionType,promotionTarget,status,conditionAction,conditionObject,conditionRewardAction,conditionRewardObject,ConditionLinkProduct,ConditionLinkProductCategories", "GET");
  }

  // ดึงข้อมูลกิจกรรม
  static getCampaigns() {
    return API.fetchData("/myPromotion/src/connection/getCampaign.php", "POST");
  }

  // ดึงข้อมูล Campaign ตาม ID
  static getCampaignById(id) {
    return API.fetchData("/myPromotion/src/connection/getCampaignById.php", "POST", { id });
  }

  // สร้าง/อัพเดทกิจกรรมใหม่ 
  static insertCampaign(dataObj) {
    return API.fetchData("/myPromotion/src/connection/insertCampaign.php", "POST", dataObj);
  }

  // ลบกิจกรรม
  static deleteCampaign(id) {
    return API.fetchData("/myPromotion/src/connection/deleteCampaign.php", "POST", { id });
  }


  // ===================================================================================================================
  // ==================================================== Promotion ====================================================
  // ===================================================================================================================
  
  // ดึงข้อมูลโปรโมชั่น
  static getPromotion() {
    return API.fetchData("/myPromotion/src/connection/getPromotion.php", "POST");
  }

  // สร้าง/อัพเดทโปรโมชั่นใหม่ 
  static insertPromotion(dataObj) {
    return API.fetchData("/myPromotion/src/connection/insertPromotion.php", "POST", dataObj);
  }

  // ลบโปรโมชั่น
  static deletePromotion(id) {
    return API.fetchData("/myPromotion/src/connection/deletePromotion.php", "POST", { id });
  }

  // ==================================================================================================================
  // ==================================================== Condition ====================================================
  // ==================================================================================================================

  // ดึงข้อมูลโปรโมชั่น
  static getCondition({ promotion_id = null, campaign_id = null, page = 1, per_page = 10 , q , sortBy, order} = {}) {
  return API.fetchData(
    "/myPromotion/src/connection/condition/getCondition.php",
    "POST",
    { promotion_id, campaign_id, page, per_page, q, sortBy, order }
    );
  }

  // สร้างเงื่อนไข (ชื่ออย่างเดียวตอนนี้)
  static insertCondition(dataObj) {
    return API.fetchData("/myPromotion/src/connection/condition/insertCondition.php", "POST", dataObj);
  }

  // ลบโปรโมชั่น
  static deleteCondition(id) {
    return API.fetchData("/myPromotion/src/connection/condition/deleteCondition.php", "POST", { id });
  }


  // ==================================================================================================================
  // ==================================================== Products ====================================================
  // ==================================================================================================================

  // ดึงข้อมูล Product
  static getProducts() {
    return API.fetchData("/myPromotion/src/connection/getData.php?include=Products,ProductsCategories,ConditionLinkProduct,ConditionLinkProductCategories", "GET");
  }

  static getConditionLinkProduct() {
    return API.fetchData("/myPromotion/src/connection/getData.php?include=Products,ProductsCategories", "GET");
  }
}