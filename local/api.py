import frappe
import json
import base64
import random
import string
from frappe.utils.file_manager import save_file
from frappe.utils import nowtime,get_url_to_form,escape_html,today
from frappe.utils.password import check_password, get_decrypted_password

@frappe.whitelist(allow_guest=True)
def getUsers(usr, pwd):
    if not verify_credentials(usr, pwd):
        return {"status": 400, "message": "Invalid Credentials"}

    # Determine user identifier
    if usr in ["Administrator", "Guest"]:
        user = frappe.get_doc("User", usr)
    else:
        user = frappe.get_value("User", {"email": usr}, "name")
        if not user:
            return {"status": 400, "message": "Invalid login credentials"}
        user = frappe.get_doc("User", user)

    # Convert to dict (includes all fields — standard + custom)
    user_data = user.as_dict()

    # Refresh and validate API secret
    api_secret = validate_api_key_secret(user_data.get("api_key"), user_data.get("api_secret"))
    user_data["api_secret"] = api_secret

    # Define roles to check
    roles_to_check = [
        "Show Logistic Booking In Mobile App",
        "Show Loading In Mobile App",
        "Show Order Delivery In Mobile App",
        "Show Crate Inward In Mobile App"
    ]

    # Get all user roles
    user_roles = frappe.get_roles(user.name)
    role_status = {role: 1 if role in user_roles else 0 for role in roles_to_check}
    user_data["role_status"] = role_status

    # Optionally, hide sensitive fields
    for key in ["password", "reset_password_key", "new_password"]:
        user_data.pop(key, None)

    return {
        "status": 200,
        "message": "Success",
        "data": user_data
    }

def verify_credentials(usr, pwd):
    try:
        # Fetch the user document
        user = frappe.get_doc('User', usr)
        
        # Check the password
        if user and check_password(user.name, pwd):
            return True
        else:
            return {
                "status":400,
                "message":"Invalid Password. Try again"
            }
    except frappe.DoesNotExistError:
        return {
            "status":400,
            "message":"Invalid credentials"
        }

def validate_api_key_secret(api_key, api_secret, frappe_authorization_source=None):
    doctype = frappe_authorization_source or "User"
    doc = frappe.get_value(doctype="User", filters={"api_key": api_key}, fieldname="name")
    
    if not doc:
        raise frappe.AuthenticationError("Invalid API key")
    doc_secret = get_decrypted_password(doctype, doc, fieldname="api_secret")
    if doctype == "User":
        user = frappe.get_value(doctype="User", filters={"api_key": api_key}, fieldname="name")
    else:
        user = frappe.get_value(doctype, doc, "User")
    
    if frappe.local.login_manager.user in ("", "Guest"):
        frappe.set_user(user)
    return doc_secret

# @frappe.whitelist(allow_guest=True)
# @frappe.whitelist()
# def create_record():
#     url = f"{BASE_URL}/api/resource/{DOCTYPE}"

#     headers = {
#         "Authorization": f"token {API_KEY}:{API_SECRET}",
#         "Content-Type": "application/json"
#     }

#     response = requests.post(url, data=json.dumps(payload), headers=headers)

#     try:
#         res_json = response.json()
#     except:
#         return {
#             "message": "Failed to create record",
#             "status_code": response.status_code,
#             "error": response.text
#         }

#     if response.status_code == 200:
#         return {
#             "message": "Record created successfully",
#             "status_code": 200,
#             "data": res_json.get("data")
#         }
#     else:
#         return {
#             "message": "Failed to create record",
#             "status_code": response.status_code,
#             "error": res_json
#         }



# import frappe
# from frappe import _

# @frappe.whitelist(True)
# def get_company_details(company_id):
#     if not frappe.db.exists("Company", company_id):
#         frappe.throw(_("Company not found"))

#     company = frappe.get_doc("Company", company_id)

#     return {
#         "name": company.name,
#         "abbr": company.abbr,
#         "default_currency": company.default_currency,
#         "country": company.country,
#         "gstin": company.gstin,
#         "pan": company.pan,
#         "default_receivable_account": company.default_receivable_account,
#         "default_payable_account": company.default_payable_account,
#     }



# import frappe
# import frappe

@frappe.whitelist(allow_guest=True)
def update_delivery_location(delivery_id, lat, lng, employee):

    existing = frappe.db.get_value(
        "Delivery Location",
        {"delivery_note_id": delivery_id},
        "name"
    )

    if existing:
        doc = frappe.get_doc("Delivery Location", existing)
        doc.latitude = lat
        doc.longitude = lng
        doc.delivery_partner = employee
        doc.save(ignore_permissions=True)

    else:
        doc = frappe.get_doc({
            "doctype": "Delivery Location",
            "delivery_note_id": delivery_id,
            "latitude": lat,
            "longitude": lng,
            "delivery_partner": employee
        })
        doc.insert(ignore_permissions=True)

    frappe.db.commit()

    return {"status": "success"}

@frappe.whitelist()
@frappe.whitelist()
def get_delivery_location(delivery_id):

    return frappe.db.get_value(
        "Delivery Location",
        {"delivery_note_id": delivery_id},
        ["latitude", "longitude"],
        as_dict=True
    )


# import time
# import frappe
# import random

# def update_location_loop():
#     delivery_id = "DN-26-00001"
#     employee = "rohan@easycloud.in"

#     while True:
#         lat = 17.059 + random.uniform(-0.001, 0.001)
#         lng = 78.208 + random.uniform(-0.001, 0.001)

#         frappe.call(
#             "local.api.update_delivery_location",
#             delivery_id=delivery_id,
#             lat=lat,
#             lng=lng,
#             employee=employee
#         )

#         time.sleep(10)


def update_the_checkbox(doc, method=None):
    print("Helloooooooo")
    # doc.db_set("custom_updated_item", 1)

def create_order(request):
    data = request

    if not data:
        return "Invalid"

    if "amount" not in data:
        return "Missing amount"

    order = {"amount": data["amount"]}
    
    print("saved")

    return order

import frappe

def check_test_tab_change(doc, method=None):
    old_doc = doc.get_doc_before_save()
    print("hfjdhfsjfhsfhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
    if not old_doc:
        return

    meta = frappe.get_meta(doc.doctype)

    in_section = False
    changed = False

    for field in meta.fields:

        # Start when your tab (Section Break) is found
        if field.fieldtype in ["Section Break", "Tab Break"] and field.label == "Test":
            in_section = True
            continue

        # Stop when next section/tab starts
        if field.fieldtype in ["Section Break", "Tab Break"] and in_section:
            break

        if not in_section:
            continue

        # ✅ Handle normal fields
        if field.fieldtype not in ["Table"] and field.fieldname:
            if doc.get(field.fieldname) != old_doc.get(field.fieldname):
                changed = True
                break

        # ✅ Handle child tables
        if field.fieldtype == "Table":
            table_field = field.fieldname

            old_rows = old_doc.get(table_field) or []
            new_rows = doc.get(table_field) or []

            if len(old_rows) != len(new_rows):
                changed = True
                break

            # Compare row-by-row
            for old_row, new_row in zip(old_rows, new_rows):
                if old_row.as_dict() != new_row.as_dict():
                    changed = True
                    break

        if changed:
            print("hfjdfhsafhaiosfhsfkjffffffffffffffffffffffffff")
            break

    # Set flag for workflow
    doc.disabled = 1 if changed else 0
    doc.custom_is_test_changed = 1 if changed else 0

def validate_material_request_reference(doc, method):
    if doc.items and not doc.items[0].material_request:
        frappe.throw(
            "This Purchase Order was not created from a Material Request. "
            "Please create the PO from the Material Request screen."
        )



import frappe

@frappe.whitelist()
def get_project_dashboard(project):

    return frappe.db.get_value(
        "Project Opening Summary",
        {"project": project},
        [
            "opening_procurement_value",
            "opening_material_receipt_value",
            "opening_supply_billed_value",
            "opening_execution_value",
            "opening_erection_billed_value"
        ],
        as_dict=True
    ) or {}
