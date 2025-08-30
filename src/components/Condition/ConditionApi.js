// modalCondition.api.js
import ConditionService from "/myPromotion/src/components/Condition/ConditionService.js";
import { getOptions } from "/myPromotion/src/assets/js/store/optionsStore.js";
import { API } from "/myPromotion/src/assets/js/api.js";

let _cache_options = null;
let _cache_products = null;

export async function getProductsCached(){
if(_cache_products) return _cache_products;
try{
if(API && typeof API.getProducts === 'function'){
const r = await API.getProducts();
_cache_products = (r && r.success && Array.isArray(r.data)) ? r.data : (r.Products || []);
} else {
const res = await fetch('/myPromotion/src/connection/product/getProducts.php', {
method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ page:1, per_page:1000 }), credentials:'same-origin'
});
const jr = await (res.ok ? res.json() : Promise.resolve({}));
_cache_products = jr.data || jr.Products || [];
}
}catch(e){ console.warn('getProductsCached failed', e); _cache_products = []; }
return _cache_products;
}


export async function apiGetConditions(params){
const normalized = {
promotion_id: Number(params.promotion_id || params.promoId || 0),
page: Number(params.page || 1),
per_page: Number(params.per_page || 20),
q: params.q || '',
is_active: params.is_active ?? 1,
sort_by: params.sort_by || 'created_at',
sort_dir: params.sort_dir || 'DESC'
};


if(typeof ConditionService?.getList === 'function'){
return ConditionService.getList({ promotion_id: normalized.promotion_id, page: normalized.page, per_page: normalized.per_page, q: normalized.q });
}
if(API && typeof API.getCondition === 'function') return API.getCondition(normalized);


try{
const r = await fetch('/myPromotion/src/connection/condition/getCondition.php', {
method:'POST', headers:{'Content-Type':'application/json; charset=utf-8'}, body: JSON.stringify(normalized), credentials:'same-origin'
});
return r.ok ? await r.json() : { success:false, error:'http ' + r.status };
}catch(e){ return { success:false, error:String(e) }; }
}


export async function apiDeleteCondition(id){
if(!id) return { success:false, error:'id required' };
if(typeof ConditionService?.delete === 'function') return ConditionService.delete(id);
if(API && typeof API.deleteCondition === 'function') return API.deleteCondition(id);
try{
const r = await fetch('/myPromotion/src/connection/condition/deleteCondition.php', { method:'POST', headers:{'Content-Type':'application/json; charset=utf-8'}, body: JSON.stringify({ id }), credentials:'same-origin' });
return r.ok ? await r.json() : { success:false, error:'http ' + r.status };
}catch(e){ return { success:false, error:String(e) }; }
}


export async function apiInsertCondition(payload){
if(typeof ConditionService?.insert === 'function') return ConditionService.insert(payload);
if(API && typeof API.insertCondition === 'function') return API.insertCondition(payload);
try{
const r = await fetch('/myPromotion/src/connection/condition/insertCondition.php', { method:'POST', headers:{'Content-Type':'application/json; charset=utf-8'}, body: JSON.stringify(payload), credentials:'same-origin' });
return r.ok ? await r.json() : { success:false, error:'http ' + r.status };
}catch(e){ return { success:false, error:String(e) }; }
}


export function clearCaches(){ _cache_options = null; _cache_products = null; }