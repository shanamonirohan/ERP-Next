# Copyright (c) 2026, rohan and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Test1(Document):
	pass

from frappe import _

def get_data():
    return {
        "fieldname": "delivery",  # The Link field in Test that points to Delivery Note
        "transactions": [
            {
                "label": _("References"),
                "items": ["Delivery Note"]
            }
        ]
    }