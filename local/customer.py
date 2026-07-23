
import frappe
from frappe import _

@frappe.whitelist(allow_guest=False)
def get_customer_details(customer_id):
    if not customer_id:
        return {"error": "Customer ID is required"}

    customer = frappe.db.get_value(
        "Customer",
        customer_id,
        ["customer_name", "email_id", "mobile_no", "customer_primary_address"],
        as_dict=True
    )

    if not customer:
        return {"error": "Customer not found"}

    if customer.customer_primary_address:
        customer["address"] = frappe.db.get_value(
            "Address",
            customer.customer_primary_address,
            ["address_line1", "address_line2", "city", "state", "pincode"],
            as_dict=True
        )

    return customer


    import frappe
from frappe.utils import nowdate

def generate_daily_sales_report():
    today = nowdate()

    sales_invoices = frappe.db.get_all(
        "Sales Invoice",
        filters={"posting_date": today, "docstatus": 1},
        fields=["name", "customer", "grand_total"]
    )

    total_sales = sum(inv.get("grand_total", 0) for inv in sales_invoices)

    frappe.logger().info(f"Daily Sales Report for {today}: Total Sales = {total_sales}")

    message = "<h3>Daily Sales Report</h3>"
    message += f"<p><b>Date:</b> {today}</p>"
    message += "<ul>"
    for inv in sales_invoices:
        message += f"<li>{inv['name']} – {inv['customer']} – ₹{inv['grand_total']}</li>"
    message += "</ul>"
    message += f"<p><b>Total Sales:</b> ₹{total_sales}</p>"

    frappe.sendmail(
        recipients=["accounts@example.com"],
        subject="Daily Sales Report",
        message=message
    )