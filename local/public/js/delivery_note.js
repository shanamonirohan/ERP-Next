frappe.ui.form.on("Delivery Note", {
    refresh(frm) {

        frm.add_custom_button("Track Delivery", () => {

            frappe.set_route(
                "delivery-tracking",
                frm.doc.name
            );

        });

    }
});

frappe.ui.form.on('Delivery Note', {

    refresh(frm) {

        if (!frm.doc.name) return;

        load_map(frm);
        start_tracking(frm);

    }

});

function load_map(frm) {

    frm.fields_dict.delivery_map.$wrapper.html(`
        <div id="map" style="height:400px"></div>
    `);

    window.map = L.map('map').setView([17.3850, 78.4867], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    var bikeIcon = L.icon({
        iconUrl: "/files/bike.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });

    window.marker = L.marker([17.3850, 78.4867], {
        icon: bikeIcon
    }).addTo(map);
}

function start_tracking(frm) {

    setInterval(() => {

        frappe.call({
            method: "local.api.get_delivery_location",
            args: {
                delivery_id: frm.doc.name
            },
            callback: function(r) {

                if (r.message) {

                    let lat = parseFloat(r.message.latitude);
                    let lng = parseFloat(r.message.longitude);

                    marker.setLatLng([lat, lng]);
                    map.setView([lat, lng]);

                }

            }
        });

    }, 3000);

}