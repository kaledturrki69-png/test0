import os
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.translation import activate, get_language
from django.conf import settings

def send_localized_email(user, template_name, context=None, language=None):
    if context is None:
        context = {}

    lang = (
        language
        or getattr(user, "language", None)
        or get_language()
        or settings.LANGUAGE_CODE
    )

    # ✅ Correct path inside the Django template loader
    base_path = f"accounts/emails/{template_name}/{lang}"

    subject_template = f"{base_path}/subject.txt"
    body_txt_template = f"{base_path}/body.txt"
    body_html_template = f"{base_path}/body.html"

    subject = render_to_string(subject_template, context).strip()
    text_body = render_to_string(body_txt_template, context)
    html_body = render_to_string(body_html_template, context)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_body, "text/html")
    email.send()
