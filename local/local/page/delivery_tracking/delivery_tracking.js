frappe.pages['delivery-tracking'].on_page_load = function(wrapper) {

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Delivery Tracking',
        single_column: true
    });

    $(page.body).html(`<div id="map" style="height:500px;width:100%"></div>`);

    let map;
    let marker;
    let delivery_id = frappe.get_route()[1];

    setTimeout(() => {

        map = L.map('map').setView([17.3850, 78.4867], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: "© OpenStreetMap"
        }).addTo(map);

        marker = L.marker([17.3850, 78.4867]).addTo(map);

        setTimeout(() => {
            map.invalidateSize();
        }, 500);

        start_tracking();

    }, 300);


    function start_tracking() {

        setInterval(() => {

            frappe.call({
                method: "local.api.get_delivery_location",
                args: {
                    delivery_id: delivery_id
                },
                callback: function(r) {

                    if (r.message) {

                        let lat = parseFloat(r.message.latitude);
                        let lng = parseFloat(r.message.longitude);

                        marker.setLatLng([lat, lng]);

                        map.panTo([lat, lng]);

                    }

                }
            });

        }, 9000);  // update every 3 seconds

    }

};