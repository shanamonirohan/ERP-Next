// Copyright (c) 2026, rohan and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Test1", {
// 	refresh(frm) {
//         frappe.addbutton("UpdateItems")
// 	},
// });



frappe.ui.form.on("Test1", {
    refresh(frm) {
        if (frm.is_new()) {
            frm.add_custom_button(__("Custom Update Items"), () => {
                open_update_items_dialog(frm);
            });
        }
    }
});