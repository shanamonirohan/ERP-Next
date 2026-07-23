frappe.pages['project-overview'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Project Overview',
        single_column: true
    });

    load_dashboard(page);
};
//commented out for now, will be used in future

function load_dashboard(page) {
    frappe.call({
        method: "your_app.api.get_project_dashboard_data",
        callback: function(r) {
            let data = r.message;

            render_cards(page, data.cards);
            render_supplier_chart(page, data.supplier_chart);
            render_contractor_chart(page, data.contractor_chart);
        }
    });
}
