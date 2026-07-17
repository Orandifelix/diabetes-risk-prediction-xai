import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from app.config import settings


def send_prediction_report_email(
    to_email: str,
    recipient_name: str,
    risk_level: str,
    pdf_bytes: bytes,
    prediction_id: int,
) -> None:
    """Send a prediction PDF report as an email attachment.

    Uses stdlib smtplib so no extra dependency is required. Raises on
    failure so the calling route can surface a clean error to the user.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise RuntimeError("Email is not configured on this server.")

    msg = MIMEMultipart()
    msg["Subject"] = "Your Diabetes Risk Prediction Report"
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email

    body = (
        f"Hi {recipient_name or 'there'},\n\n"
        f"Attached is your diabetes risk prediction report "
        f"(Risk Level: {risk_level}).\n\n"
        "This is a screening estimate, not a medical diagnosis. Please "
        "discuss these results with a healthcare professional.\n\n"
        "— Dida, Diabetes Risk Predictor"
    )
    msg.attach(MIMEText(body, "plain"))

    attachment = MIMEApplication(pdf_bytes, _subtype="pdf")
    attachment.add_header(
        "Content-Disposition",
        "attachment",
        filename=f"diabetes_risk_report_{prediction_id}.pdf",
    )
    msg.attach(attachment)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
