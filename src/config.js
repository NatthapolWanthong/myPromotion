export function MainStatusData(MainID){
    let CardsStatus, main_Color, bg_Color;
    switch (MainID) {
        case "1": CardsStatus = "cards-Active"; main_Color = "#198754"; bg_Color = "#d1e7dd"; break;
        case "2": CardsStatus = "cards-Pending"; main_Color = "#0d6efd"; bg_Color = "#e7f1ff"; break;
        case "3": CardsStatus = "cards-Close"; main_Color = "#dc3545"; bg_Color = "#f8d7da"; break;
        case "4": CardsStatus = "cards-Expire"; main_Color = "#7b4b2a"; bg_Color = "#f3e3d3"; break;
    }
    return {CardsStatus, main_Color, bg_Color};
}