frappe.pages['testing'].on_page_load = function(wrapper) {

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Project Dashboard',
        single_column: true
    });

    const project = page.add_field({
        fieldname: 'project',
        label: 'Project',
        fieldtype: 'Link',
        options: 'Project',
        change() {
            load_dashboard(project.get_value());
        }
    });

    $(page.body).append(`
        <div class="dashboard-cards row mt-4"></div>
    `);

    function load_dashboard(project_name) {

        frappe.call({
            method: 'local.api.get_project_dashboard',
            args: {
                project: project_name
            }
        }).then(r => {

            console.log(r);

            if (!r.message) return;

            $('.dashboard-cards').html(`
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body">
                            Procurement:
                            ${r.message.opening_procurement_value || 0}
                        </div>
                    </div>
                </div>
            `);
        });
    }
};