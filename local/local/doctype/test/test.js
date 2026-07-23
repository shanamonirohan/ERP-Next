// Copyright (c) 2026, rohan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Test", {
    from_date(frm) {
        calculate_total_days(frm);
    },
    to_date(frm) {
        calculate_total_days(frm);
    }
});

function calculate_total_days(frm) {
    if (frm.doc.from_date && frm.doc.to_date) {
        let from_date = frappe.datetime.str_to_obj(frm.doc.from_date);
        let to_date = frappe.datetime.str_to_obj(frm.doc.to_date);
        console.log(frm.doc.fomr_date-frm.doc.to_date);
        if (from_date > to_date) {
            frappe.msgprint({
                title: __("Invalid Date Range"),
                message: __("From Date must be before or equal to To Date"),
                indicator: "red"
            });
            frm.set_value("to_date", null);
            frm.set_value("total_days", 0);
            return;
        }
        let diff_days =
            frappe.datetime.get_day_diff(frm.doc.to_date, frm.doc.from_date) + 1;

        frm.set_value("total_days", diff_days);
    }
}

// client_script for doctype: Test
// Place this in: Test > Customize Form > Client Script
// OR in: /public/js/test.js (if using custom app)
// =============================================
// Client Script for Doctype: Test
// =============================================

frappe.ui.form.on('Test', {
    refresh: function(frm) {
        // No custom button needed on parent — removed to fix the error
    }
});

frappe.ui.form.on('Product Test', {
    form_render: function(frm, cdt, cdn) {
        inject_po_multiselect(frm, cdt, cdn);
    }
});

function inject_po_multiselect(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    let row_name = cdn;

    // Avoid duplicate injection
    let wrapper_id = `po-multiselect-${row_name}`;
    if (document.getElementById(wrapper_id)) return;

    // Find the open grid row form wrapper
    let grid_row = null;

    // Loop through all grid fields to find the one with 'Product Test'
    for (let key in frm.fields_dict) {
        let field = frm.fields_dict[key];
        if (field && field.grid && field.grid.doctype === 'Product Test') {
            try {
                grid_row = field.grid.get_row(row_name);
            } catch(e) {}
            if (grid_row) break;
        }
    }

    if (!grid_row || !grid_row.form_wrapper) {
        console.warn('PO Multiselect: Could not find grid row form_wrapper for', row_name);
        return;
    }

    let form_wrapper = grid_row.form_wrapper;
    let $section = $(form_wrapper).find('.form-column').last();

    if (!$section.length) {
        $section = $(form_wrapper);
    }

    // Build the multiselect widget
    let $wrapper = $(`
        <div id="${wrapper_id}" class="frappe-control" style="margin-top: 12px; padding: 0 8px;">
            <div class="form-group">
                <div class="clearfix">
                    <label class="control-label">Purchase Orders</label>
                </div>
                <div class="control-input-wrapper" style="position: relative;">
                    <div class="po-multiselect-input"
                         style="min-height: 34px; border: 1px solid var(--border-color);
                                border-radius: 4px; padding: 4px 6px;
                                display: flex; flex-wrap: wrap; gap: 4px;
                                cursor: text; background: var(--control-bg);">
                    </div>
                    <div class="po-dropdown"
                         style="display:none; position:absolute; top:100%; left:0;
                                background: var(--popover-bg, #fff);
                                border: 1px solid var(--border-color);
                                border-radius: 4px; z-index: 9999;
                                max-height: 200px; overflow-y: auto;
                                width: 100%; min-width: 220px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.12);">
                    </div>
                </div>
                <p class="help-box small text-muted" style="margin-top:4px;">
                    Search and select linked Purchase Orders
                </p>
            </div>
        </div>
    `);

    $section.append($wrapper);

    // Load existing saved values
    let selected_pos = [];
    if (row.purchase_orders) {
        try {
            let parsed = JSON.parse(row.purchase_orders);
            selected_pos = Array.isArray(parsed) ? parsed : [];
        } catch(e) {
            selected_pos = row.purchase_orders
                .split('\n')
                .map(s => s.trim())
                .filter(Boolean);
        }
    }

    function render_tags() {
        let $input_area = $wrapper.find('.po-multiselect-input');
        $input_area.find('.po-tag').remove();

        selected_pos.forEach(function(po) {
            let $tag = $(`
                <span class="po-tag"
                      style="background: var(--blue-100, #e8f4ff);
                             color: var(--blue-700, #1a73e8);
                             border: 1px solid var(--blue-300, #90c4f9);
                             border-radius: 12px; padding: 2px 10px;
                             font-size: 12px; display: inline-flex;
                             align-items: center; gap: 5px; white-space: nowrap;">
                    ${frappe.utils.escape_html(po)}
                    <span class="po-remove" data-po="${frappe.utils.escape_html(po)}"
                          style="cursor:pointer; font-size:14px; font-weight:bold;
                                 color: var(--blue-500, #4a9cf6); line-height:1;">×</span>
                </span>
            `);
            $input_area.prepend($tag);
        });
    }

    function save_to_row() {
        frappe.model.set_value(cdt, cdn, 'purchase_orders', selected_pos.join('\n'));
    }

    function show_dropdown(search_txt) {
        let $dropdown = $wrapper.find('.po-dropdown');
        $dropdown.html('<div style="padding:8px; font-size:12px; color:var(--text-muted);">Searching...</div>').show();

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Purchase Order',
                filters: search_txt
                    ? [['name', 'like', `%${search_txt}%`]]
                    : [],
                fields: ['name'],
                limit: 20
            },
            callback: function(r) {
                $dropdown.empty();

                let results = (r.message || []).filter(po => !selected_pos.includes(po.name));

                if (!results.length) {
                    $dropdown.html('<div style="padding:8px 12px; color:var(--text-muted); font-size:13px;">No results found</div>');
                    return;
                }

                results.forEach(function(po) {
                    let $item = $(`
                        <div class="po-option"
                             data-value="${frappe.utils.escape_html(po.name)}"
                             style="padding: 7px 12px; cursor:pointer;
                                    font-size: 13px; color: var(--text-color);">
                            ${frappe.utils.escape_html(po.name)}
                        </div>
                    `);

                    $item.on('mouseenter', function() {
                        $(this).css('background', 'var(--bg-light-gray, #f5f5f5)');
                    }).on('mouseleave', function() {
                        $(this).css('background', '');
                    }).on('mousedown', function(e) {
                        // mousedown fires before blur so dropdown stays open
                        e.preventDefault();
                        let val = $(this).data('value');
                        if (val && !selected_pos.includes(val)) {
                            selected_pos.push(val);
                            render_tags();
                            save_to_row();
                        }
                        $dropdown.hide();
                        $wrapper.find('.po-search-input').val('');
                    });

                    $dropdown.append($item);
                });
            }
        });
    }

    // Search input inside tag area
    let $search = $(`
        <input type="text" class="po-search-input"
               placeholder="Search Purchase Order..."
               style="border:none; outline:none; flex:1; min-width:150px;
                      background:transparent; color:var(--text-color);
                      font-size:13px; padding: 2px 4px;">
    `);
    $wrapper.find('.po-multiselect-input').append($search);

    $search.on('focus', function() {
        show_dropdown($(this).val());
    }).on('input', function() {
        show_dropdown($(this).val());
    }).on('blur', function() {
        // Small delay so mousedown on option fires first
        setTimeout(() => $wrapper.find('.po-dropdown').hide(), 150);
    });

    // Remove tag
    $wrapper.on('click', '.po-remove', function(e) {
        e.stopPropagation();
        let po = $(this).data('po');
        selected_pos = selected_pos.filter(v => v !== po);
        render_tags();
        save_to_row();
    });

    render_tags();
}