# Copyright (c) 2026, rohan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Test(Document):
	def before_save(self):
		doc=self
		# frappe.throw("Doc has been saving is it oaky")

	def validate(self):
		doc=self
		doc.phone_number="7093271497"

	def on_submit(self):
		doc=self
		doc.phone_number="63022259556"

	def on_cancel(self):
		doc=self
		frappe.throw("Doc has been Cancelled")
